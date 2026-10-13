alter table public.products add column if not exists category text not null default '볼캡';
alter table public.products add column if not exists stock_quantity integer not null default 0 check (stock_quantity >= 0);

grant usage on schema public to anon, authenticated;
grant select on public.products, public.categories, public.product_options to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter table public.products enable row level security;
drop policy if exists "public reads catalog" on public.products;
create policy "public reads catalog" on public.products
for select using(true);

drop policy if exists "authenticated manages products" on public.products;
create policy "authenticated manages products" on public.products
for all to authenticated using (true) with check (true);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('product-images','product-images',true,5242880,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=true, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images" on storage.objects
for insert to authenticated with check (bucket_id='product-images');

drop policy if exists "Authenticated users can update product images" on storage.objects;
create policy "Authenticated users can update product images" on storage.objects
for update to authenticated using (bucket_id='product-images') with check (bucket_id='product-images');

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
