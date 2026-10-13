grant select, insert, delete on public.wishlists to authenticated;
alter table public.wishlists enable row level security;
drop policy if exists "user manages own wishlist" on public.wishlists;
create policy "user manages own wishlist" on public.wishlists
for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);

insert into public.products(title,category,price,stock_quantity,status,description,images)
select seed.title,seed.category,seed.price,seed.stock_quantity,'active',seed.description,seed.images
from (values
  ('코듀로이 캠프 캡','볼캡',34900,12,'낮은 크라운과 따뜻한 질감이 조화로운 캠프 캡.',array[]::text[]),
  ('리버서블 체크 버킷','버킷햇',37900,9,'무지와 체크 양면으로 스타일이 바뀌는 버킷햇.',array[]::text[]),
  ('위빙 레더 퍼 트루퍼','겨울모자',68900,8,'입체적인 위빙 텍스처와 크림 퍼를 조합한 프리미엄 트루퍼 햇.',array['https://snnfbcvnsziyveplgbwk.supabase.co/storage/v1/object/public/product-images/winter-01.png']),
  ('블랙 레더 윈터 트루퍼','겨울모자',74900,6,'매끈한 블랙 레더와 풍성한 퍼로 완성한 한겨울 시그니처 아이템.',array['https://snnfbcvnsziyveplgbwk.supabase.co/storage/v1/object/public/product-images/winter-02.png']),
  ('네이비 패디드 이어플랩','겨울모자',45900,10,'가볍게 누빈 네이비 원단과 블랙 퍼가 찬바람을 막아주는 이어플랩.',array['https://snnfbcvnsziyveplgbwk.supabase.co/storage/v1/object/public/product-images/winter-03.png']),
  ('테디 플리스 트래퍼','겨울모자',52900,7,'귀와 목까지 폭신하게 감싸는 브라운 테디 플리스 트래퍼.',array['https://snnfbcvnsziyveplgbwk.supabase.co/storage/v1/object/public/product-images/winter-04.png']),
  ('차콜 울 이어플랩 캡','겨울모자',49800,9,'접어 올릴 수 있는 이어플랩을 더한 데일리 캡.',array['https://snnfbcvnsziyveplgbwk.supabase.co/storage/v1/object/public/product-images/winter-05.png']),
  ('아이보리 퍼 토크','겨울모자',55900,5,'블랙 크라운과 아이보리 시어링 밴드의 감각적인 대비.',array['https://snnfbcvnsziyveplgbwk.supabase.co/storage/v1/object/public/product-images/winter-06.png']),
  ('헤링본 방한 헌팅캡','겨울모자',46900,11,'클래식한 헤링본 울과 실용적인 이어커버의 윈터 헌팅캡.',array['https://snnfbcvnsziyveplgbwk.supabase.co/storage/v1/object/public/product-images/winter-07.png'])
) as seed(title,category,price,stock_quantity,description,images)
where not exists(select 1 from public.products p where p.title=seed.title);
