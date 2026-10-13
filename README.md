# 다써바 모자 전문 쇼핑몰

PRD v1.0.0을 바탕으로 만든 Next.js App Router 쇼핑몰입니다. 모바일/데스크톱 스토어, 상품 필터·상세, 장바구니, 로그인 진입점, 1+1/단체제작, 상담 챗봇, 운영자 대시보드와 Supabase 초기 스키마를 포함합니다.

## 실행

1. `.env.example`을 `.env.local`로 복사합니다.
2. Supabase Dashboard의 Connect/API Keys에서 Publishable key(또는 anon public key)를 입력합니다.
3. `npm install`
4. `npm run dev`

Supabase SQL Editor에서 `supabase/migrations/202610120001_initial_schema.sql`을 실행하면 `members`를 포함한 테이블, Auth 회원 자동 등록 트리거와 RLS 정책이 생성됩니다.

## 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL`: `https://snnfbcvnsziyveplgbwk.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: 클라이언트용 공개 키
- `NEXT_PUBLIC_KAKAO_CHAT_URL`: 카카오톡 채널 상담 URL

결제 실연동은 PortOne 또는 토스페이먼츠 상점 키와 웹훅 URL을 받은 뒤 서버 측 주문 검증을 추가해야 합니다.
