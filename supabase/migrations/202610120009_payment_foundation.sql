-- 결제 기반 스키마와 기존 관리자 권한 보강
create extension if not exists "pgcrypto";
alter table public.orders add column if not exists payment_status text not null default 'created' check (payment_status in ('created','pending','paid','failed','cancelled','partially_refunded','refunded'));
alter table public.orders add column if not exists fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled','preparing','shipped','delivered','cancelled'));
alter table public.orders add column if not exists client_request_key uuid;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists failed_at timestamptz;
alter table public.orders add column if not exists cancelled_at timestamptz;
alter table public.orders add column if not exists shipping_request text;
create unique index if not exists orders_user_request_key_uidx on public.orders(user_id,client_request_key) where client_request_key is not null;
create unique index if not exists products_title_uidx on public.products(lower(title));
create table if not exists public.payments (id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,provider text not null default 'toss',payment_key text unique,idempotency_key uuid not null unique,requested_amount integer not null check(requested_amount>=0),approved_amount integer,method text,status text not null default 'pending',failure_code text,failure_message text,approved_at timestamptz,cancelled_amount integer not null default 0,provider_response jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create unique index if not exists payments_one_active_per_order on public.payments(order_id) where status in ('pending','paid','partially_refunded');
create table if not exists public.payment_events (id bigint generated always as identity primary key,provider text not null default 'toss',transmission_id text not null unique,event_type text not null,payment_key text,payload_hash text not null,status text not null default 'received',error_message text,received_at timestamptz not null default now(),processed_at timestamptz);
create table if not exists public.admin_audit_logs (id bigint generated always as identity primary key,actor_id uuid references public.members(id),action text not null,target_type text not null,target_id text not null,metadata jsonb not null default '{}',created_at timestamptz not null default now());
alter table public.payments enable row level security; alter table public.payment_events enable row level security; alter table public.admin_audit_logs enable row level security;
drop policy if exists "authenticated manages products" on public.products;
drop policy if exists "authenticated reads orders" on public.orders;
drop policy if exists "authenticated updates orders" on public.orders;
drop policy if exists "authenticated reads order items" on public.order_items;
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admins update orders" on public.orders for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admins read all order items" on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
create policy "users read own payments" on public.payments for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
create policy "admins read payment events" on public.payment_events for select to authenticated using(public.is_admin());
create policy "admins read audit logs" on public.admin_audit_logs for select to authenticated using(public.is_admin());

create or replace function public.create_checkout_order(p_items jsonb,p_recipient_name text,p_recipient_phone text,p_postcode text,p_address text,p_address_detail text,p_shipping_request text,p_request_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v_order_id uuid;v_order_number text;v_subtotal integer:=0;v_shipping integer:=0;v_total integer:=0;v_item jsonb;v_product public.products%rowtype;v_qty integer;
begin
 if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'EMPTY_CART'; end if;
 if nullif(trim(p_recipient_name),'') is null or nullif(trim(p_recipient_phone),'') is null or nullif(trim(p_postcode),'') is null or nullif(trim(p_address),'') is null then raise exception 'INVALID_SHIPPING'; end if;
 select id,order_number,total_amount into v_order_id,v_order_number,v_total from public.orders where user_id=v_user and client_request_key=p_request_key;
 if found then return jsonb_build_object('id',v_order_id,'orderNumber',v_order_number,'amount',v_total,'reused',true); end if;
 for v_item in select * from jsonb_array_elements(p_items) loop
  v_qty:=greatest(0,coalesce((v_item->>'quantity')::integer,0)); if v_qty<1 or v_qty>20 then raise exception 'INVALID_QUANTITY'; end if;
  select * into v_product from public.products where lower(title)=lower(v_item->>'title') for update;
  if not found then raise exception 'PRODUCT_NOT_FOUND'; end if; if v_product.status<>'active' then raise exception 'PRODUCT_NOT_SALEABLE'; end if; if v_product.stock_quantity<v_qty then raise exception 'INSUFFICIENT_STOCK'; end if;
  v_subtotal:=v_subtotal+v_product.price*v_qty;
 end loop;
 v_shipping:=case when v_subtotal>=50000 then 0 else 3000 end;v_total:=v_subtotal+v_shipping;v_order_number:='DSB-'||upper(replace(gen_random_uuid()::text,'-',''));
 insert into public.orders(user_id,order_number,subtotal,discount_amount,shipping_fee,total_amount,status,payment_status,fulfillment_status,recipient_name,recipient_phone,address,shipping_request,client_request_key)
 values(v_user,v_order_number,v_subtotal,0,v_shipping,v_total,'pending','created','unfulfilled',trim(p_recipient_name),trim(p_recipient_phone),jsonb_build_object('postcode',trim(p_postcode),'address',trim(p_address),'detail',trim(p_address_detail)),nullif(trim(p_shipping_request),''),p_request_key) returning id into v_order_id;
 for v_item in select * from jsonb_array_elements(p_items) loop v_qty:=(v_item->>'quantity')::integer;select * into v_product from public.products where lower(title)=lower(v_item->>'title');insert into public.order_items(order_id,product_id,title,unit_price,quantity) values(v_order_id,v_product.id,v_product.title,v_product.price,v_qty);end loop;
 return jsonb_build_object('id',v_order_id,'orderNumber',v_order_number,'subtotal',v_subtotal,'discountAmount',0,'shippingFee',v_shipping,'amount',v_total,'reused',false);
end $$;
revoke all on function public.create_checkout_order(jsonb,text,text,text,text,text,text,uuid) from public;
grant execute on function public.create_checkout_order(jsonb,text,text,text,text,text,text,uuid) to authenticated;
