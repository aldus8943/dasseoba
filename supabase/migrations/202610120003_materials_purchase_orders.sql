grant select on public.materials, public.purchase_orders to anon, authenticated;
grant insert, update, delete on public.materials, public.purchase_orders to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter table public.materials enable row level security;
alter table public.purchase_orders enable row level security;

drop policy if exists "public reads materials" on public.materials;
create policy "public reads materials" on public.materials for select using(true);
drop policy if exists "authenticated manages materials" on public.materials;
create policy "authenticated manages materials" on public.materials
for all to authenticated using(true) with check(true);

drop policy if exists "public reads purchase orders" on public.purchase_orders;
create policy "public reads purchase orders" on public.purchase_orders for select using(true);
drop policy if exists "authenticated manages purchase orders" on public.purchase_orders;
create policy "authenticated manages purchase orders" on public.purchase_orders
for all to authenticated using(true) with check(true);

insert into public.materials(name,code,unit,current_stock,safety_stock)
values
  ('고밀도 코튼 원단','FAB-COT-01','yd',84,30),
  ('메탈 스냅','ACC-SNP-02','개',26,50),
  ('기능성 땀받이','ACC-SWB-01','m',12,20),
  ('자수실 네이비','THR-NVY-04','콘',38,10)
on conflict (code) do update set
  name=excluded.name, unit=excluded.unit,
  current_stock=excluded.current_stock, safety_stock=excluded.safety_stock,
  updated_at=now();
