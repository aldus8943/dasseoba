grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

drop policy if exists "authenticated reads orders" on public.orders;
create policy "authenticated reads orders" on public.orders
for select to authenticated using (true);

drop policy if exists "authenticated updates orders" on public.orders;
create policy "authenticated updates orders" on public.orders
for update to authenticated using (true) with check (true);

drop policy if exists "authenticated reads order items" on public.order_items;
create policy "authenticated reads order items" on public.order_items
for select to authenticated using (true);

insert into public.orders
  (user_id, order_number, subtotal, shipping_fee, total_amount, status,
   recipient_name, recipient_phone, address, tracking_number)
select m.id, seed.order_number, seed.total_amount, 0, seed.total_amount,
       seed.status::public.order_status, seed.recipient_name, '010-0000-0000',
       seed.address, nullif(seed.tracking_number, '')
from (values
  ('DSB-261012-1042',64800,'paid','김다은','', '{}'::jsonb),
  ('DSB-261012-1039',39900,'preparing','이서준','', '{"business_no":"120-88-12345"}'::jsonb),
  ('DSB-261011-0981',26900,'shipped','박지민','123456789012', '{}'::jsonb),
  ('DSB-261011-0974',37900,'delivered','최유진','987654321098', '{"business_no":"214-81-54321"}'::jsonb)
) as seed(order_number,total_amount,status,recipient_name,tracking_number,address)
cross join lateral (select id from public.members order by created_at limit 1) m
where not exists (select 1 from public.orders o where o.order_number=seed.order_number);

insert into public.order_items(order_id,product_id,title,unit_price,quantity)
select o.id,p.id,seed.title,seed.unit_price,seed.quantity
from (values
  ('DSB-261012-1042','에브리데이 워시드 볼캡',24900,1),
  ('DSB-261012-1042','클럽 커스텀 볼캡 1+1',39900,1),
  ('DSB-261012-1039','클럽 커스텀 볼캡 1+1',39900,1),
  ('DSB-261011-0981','러닝 라이트 선바이저',26900,1),
  ('DSB-261011-0974','리버서블 체크 버킷',37900,1)
) as seed(order_number,title,unit_price,quantity)
join public.orders o on o.order_number=seed.order_number
join public.products p on p.title=seed.title
where not exists (
  select 1 from public.order_items oi
  where oi.order_id=o.id and oi.product_id=p.id
);
