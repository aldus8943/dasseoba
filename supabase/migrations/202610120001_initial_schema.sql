-- 다써바 초기 스키마: Supabase SQL Editor 또는 CLI로 적용하세요.
create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'admin');
create type public.order_status as enum ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type public.board_type as enum ('qna', 'free', 'reservation');

create table public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null, name text not null default '', phone text, role public.user_role not null default 'customer',
  points integer not null default 0 check (points >= 0), created_at timestamptz not null default now()
);
create table public.categories (id bigint generated always as identity primary key, name text not null unique, slug text not null unique, sort_order integer not null default 0);
create table public.products (
  id bigint generated always as identity primary key, category_id bigint references public.categories(id), title text not null,
  description text not null default '', price integer not null check (price >= 0), original_price integer,
  is_bundle_1plus1 boolean not null default false, custom_available boolean not null default false,
  images text[] not null default '{}', status text not null default 'active' check (status in ('draft','active','sold_out','archived')),
  category text not null default '볼캡', stock_quantity integer not null default 0 check (stock_quantity >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_options (
  id bigint generated always as identity primary key, product_id bigint not null references public.products(id) on delete cascade,
  color text not null, size text not null default 'FREE', embroidery_position text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0), unique(product_id,color,size,embroidery_position)
);
create table public.coupons (id bigint generated always as identity primary key, code text not null unique, discount_type text not null check(discount_type in ('fixed','percent')), discount_value integer not null, min_order_amount integer not null default 0, starts_at timestamptz, ends_at timestamptz, active boolean not null default true);
create table public.orders (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.members(id), order_number text not null unique,
  subtotal integer not null, discount_amount integer not null default 0, points_used integer not null default 0,
  shipping_fee integer not null default 0, total_amount integer not null, status public.order_status not null default 'pending',
  recipient_name text not null, recipient_phone text not null, address jsonb not null, tracking_number text,
  cancellation_reason text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (id bigint generated always as identity primary key, order_id uuid not null references public.orders(id) on delete cascade, product_id bigint not null references public.products(id), option_id bigint references public.product_options(id), title text not null, option_label text, unit_price integer not null, quantity integer not null check(quantity > 0));
create table public.wishlists (user_id uuid references public.members(id) on delete cascade, product_id bigint references public.products(id) on delete cascade, created_at timestamptz not null default now(), primary key(user_id,product_id));
create table public.point_ledger (id bigint generated always as identity primary key, user_id uuid not null references public.members(id) on delete cascade, order_id uuid references public.orders(id), amount integer not null, reason text not null, created_at timestamptz not null default now());
create table public.materials (id bigint generated always as identity primary key, name text not null, code text not null unique, unit text not null, current_stock numeric(12,2) not null default 0, safety_stock numeric(12,2) not null default 0, updated_at timestamptz not null default now());
create table public.purchase_orders (id bigint generated always as identity primary key, supplier_name text not null, material_id bigint not null references public.materials(id), quantity numeric(12,2) not null check(quantity > 0), status text not null default 'draft' check(status in ('draft','ordered','received','cancelled')), expected_at date, created_by uuid references public.members(id), created_at timestamptz not null default now());
create table public.posts (id bigint generated always as identity primary key, board_type public.board_type not null, title text not null, content text not null, is_secret boolean not null default false, user_id uuid not null references public.members(id), status text not null default 'open', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.reviews (id bigint generated always as identity primary key, order_item_id bigint not null unique references public.order_items(id), user_id uuid not null references public.members(id), rating integer not null check(rating between 1 and 5), content text not null, images text[] not null default '{}', approved boolean not null default false, created_at timestamptz not null default now());

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.members where id = auth.uid() and role = 'admin') $$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$ begin insert into public.members(id,email,name) values(new.id,coalesce(new.email,''),coalesce(new.raw_user_meta_data->>'name','')); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Public catalog image bucket. Uploads stay restricted to authenticated users;
-- storefront visitors only need read access.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects
for select using (bucket_id = 'product-images');

drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images" on storage.objects
for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "Authenticated users can update product images" on storage.objects;
create policy "Authenticated users can update product images" on storage.objects
for update to authenticated using (bucket_id = 'product-images') with check (bucket_id = 'product-images');

alter table public.members enable row level security; alter table public.products enable row level security; alter table public.product_options enable row level security;
alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.wishlists enable row level security;
alter table public.point_ledger enable row level security; alter table public.materials enable row level security; alter table public.purchase_orders enable row level security;
alter table public.posts enable row level security; alter table public.reviews enable row level security; alter table public.categories enable row level security; alter table public.coupons enable row level security;

create policy "public reads catalog" on public.products for select using(true);
create policy "public reads categories" on public.categories for select using(true);
create policy "public reads options" on public.product_options for select using(true);
create policy "public reads active coupons" on public.coupons for select using(active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
create policy "user reads own member row" on public.members for select using(auth.uid() = id or public.is_admin());
create policy "user updates own member row" on public.members for update using(auth.uid() = id) with check(auth.uid() = id);
create policy "user manages own orders" on public.orders for select using(auth.uid() = user_id or public.is_admin());
create policy "user creates own orders" on public.orders for insert with check(auth.uid() = user_id);
create policy "user reads own order items" on public.order_items for select using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
create policy "user manages own wishlist" on public.wishlists for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "user reads own points" on public.point_ledger for select using(auth.uid()=user_id or public.is_admin());
create policy "posts readable by owner or public" on public.posts for select using(not is_secret or auth.uid()=user_id or public.is_admin());
create policy "user creates own posts" on public.posts for insert with check(auth.uid()=user_id);
create policy "approved reviews public" on public.reviews for select using(approved or auth.uid()=user_id or public.is_admin());
create policy "verified buyer reviews" on public.reviews for insert with check(auth.uid()=user_id and exists(select 1 from public.order_items oi join public.orders o on o.id=oi.order_id where oi.id=order_item_id and o.user_id=auth.uid() and o.status='delivered'));
create policy "admin full products" on public.products for all using(public.is_admin()) with check(public.is_admin());
create policy "admin full options" on public.product_options for all using(public.is_admin()) with check(public.is_admin());
create policy "admin full materials" on public.materials for all using(public.is_admin()) with check(public.is_admin());
create policy "admin full purchase orders" on public.purchase_orders for all using(public.is_admin()) with check(public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.products, public.categories, public.product_options to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant usage, select on all sequences in schema public to authenticated;

drop policy if exists "authenticated manages products" on public.products;
create policy "authenticated manages products" on public.products
for all to authenticated using (true) with check (true);

insert into public.categories(name,slug,sort_order) values ('볼캡','ball-cap',1),('버킷햇','bucket-hat',2),('비니','beanie',3),('선바이저','sun-visor',4),('단체제작','custom',5) on conflict do nothing;

insert into public.products(title,category,price,stock_quantity,status,description)
select seed.title,seed.category,seed.price,seed.stock_quantity,seed.status,seed.description
from (values
  ('에브리데이 워시드 볼캡','볼캡',24900,18,'active','부드럽게 길들인 코튼과 안정적인 6패널 핏.'),
  ('플랫 브림 시그니처 캡','볼캡',28900,7,'active','간결한 자수와 넓은 챙이 만드는 선명한 실루엣.'),
  ('투웨이 스트링 버킷햇','버킷햇',32900,3,'active','스트링을 더해 바람 부는 날에도 편안한 아웃도어 햇.'),
  ('소프트 립 숏 비니','비니',21900,24,'active','까슬거림 없이 포근하고 가볍게 접히는 데일리 비니.'),
  ('러닝 라이트 선바이저','선바이저',26900,11,'active','땀은 빠르게 말리고 시야는 넓게 잡아주는 초경량 바이저.'),
  ('클럽 커스텀 볼캡 1+1','단체제작',39900,0,'sold_out','두 가지 컬러를 골라 즐기는 자수 커스텀 기획 세트.')
) as seed(title,category,price,stock_quantity,status,description)
where not exists (select 1 from public.products p where p.title=seed.title);
