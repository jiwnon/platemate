# Kurious 프로젝트 진행 상황

## 서비스 개요
외국인 관광객용 QR 주문 시스템 (Korea + Curious)
- 다국어 (한/영/중/일)
- AI 도슨트 (OpenAI GPT-4o-mini)
- 결제: 토스페이먼츠(한국 카드), Stripe(알리페이, 위챗페이, 카드)
- 비공개 평가 → AI 주간 리포트 예정

## 기술 스택
- Next.js 15 (App Router) + TypeScript
- Supabase (PostgreSQL + Realtime)
- Tailwind CSS + Framer Motion
- OpenAI API
- next-intl (i18n)
- 결제: 토스페이먼츠, Stripe
- 배포: Cloudflare (OpenNext 어댑터)

## DB 스키마
```sql
restaurants: id, name, slug, logo_url, name_i18n, created_at, updated_at
tables: id, restaurant_id, name, table_number, qr_code, created_at, updated_at
menu_items: id, restaurant_id, name, description, name_i18n, description_i18n,
            price, image_url, docent_content, sort_order, is_available,
            created_at, updated_at
orders: id, restaurant_id, table_id, status, total_amount, payment_status,
        locale, payment_provider, payment_key, created_at, updated_at
order_items: id, order_id, menu_item_id, quantity, unit_price, options, created_at
private_reviews: id, order_id, restaurant_id, rating, food_rating, service_rating,
                 comment, liked_items (JSONB), created_at
```

## 완료된 기능

### ✅ Step A-1: 메뉴 목록 페이지
- 경로: /[locale]/order/[restaurantId]/[tableId]
- 기능: 메뉴 카드, 카테고리 탭, 장바구니 바
- 컴포넌트: OrderPageContent, OrderMenuCard, CartBar

### ✅ Step A-2: 메뉴 상세 모달
- API: POST /api/ai/generate-docent
- 컴포넌트: MenuDetailModal, DocentSection
- AI 도슨트 자동 생성 및 DB 저장

### ✅ Step A-3: 장바구니 & 주문 생성
- API: POST /api/orders/create
- 컴포넌트: CartModal
- 결제 페이지로 이동: /[locale]/order/.../checkout/[orderId]

### ✅ Step A-4: 결제 연동
- **토스페이먼츠**: 한국 카드 결제
  - API: POST /api/payments/toss/confirm
  - 성공/실패: checkout/[orderId]/success, checkout/[orderId]/fail
- **Stripe**: 외국인 결제 (Alipay, WeChat Pay, Card)
  - API: POST /api/payments/stripe/create-session
  - Webhook: POST /api/payments/stripe/webhook (payment_status 업데이트)
  - 성공 시 verify-session으로 주문 상태 동기화
- 컴포넌트: CheckoutContent (결제 수단 선택), CheckoutComplete
- 결제 성공 → orders.payment_status = 'paid'

### ✅ Step A-5: 주문 완료 & 비공개 평가
- CheckoutComplete: 결제 완료 30분 후 ReviewModal 자동 표시
- ReviewModal: 음식/서비스 별점(1–5), 개선 의견, 좋았던 메뉴 체크박스
- API: POST /api/reviews/create (private_reviews 저장)
- GET /api/orders/[orderId]에 items(메뉴명) 포함

### ✅ Step B: 사장님 대시보드
- 경로: /[locale]/dashboard/[restaurantId]
- **신규 주문**: status=pending 목록, Supabase Realtime 자동 갱신
- **주문 카드**: 테이블 번호/이름, 메뉴 목록, 총 금액, 주문 시간, "완료" 버튼
- **오늘 통계**: 주문 건수, 매출, 평균 객단가 (카드 3개)
- API: GET /api/dashboard/[restaurantId], PATCH /api/orders/[orderId] (status)
- 컴포넌트: DashboardContent, OrderCard, StatsCards
- Realtime: orders 테이블 복제 활성화 필요 (`ALTER PUBLICATION supabase_realtime ADD TABLE orders;`)

## 주요 파일 경로
```
src/
  app/[locale]/
    dashboard/[restaurantId]/
      page.tsx                  # 사장님 대시보드
    order/[restaurantId]/[tableId]/
      page.tsx                    # 메뉴 목록
      checkout/[orderId]/
        page.tsx                  # 결제 수단 선택 (토스 / Stripe)
        success/page.tsx          # 결제 성공 (토스 또는 Stripe)
        fail/page.tsx             # 결제 실패
  api/
    ai/generate-docent/           # AI 도슨트 생성
    dashboard/[restaurantId]/     # 대시보드 데이터 (pending 목록 + 오늘 통계)
    orders/
      create/                     # 주문 생성
      [orderId]/                  # 주문 단건 조회 (GET), 상태 변경 (PATCH)
    reviews/create/               # 비공개 평가 제출
    payments/
      toss/confirm/               # 토스 결제 승인
      stripe/
        create-session/           # Stripe Checkout Session 생성
        verify-session/            # Stripe 결제 확인 (성공 페이지용)
        webhook/                  # Stripe webhook (checkout.session.completed)
  components/customer/
    OrderPageContent.tsx
    OrderMenuCard.tsx
    CartBar.tsx
    MenuDetailModal.tsx
    DocentSection.tsx
    CartModal.tsx
    CheckoutContent.tsx           # 결제 수단 선택
    CheckoutComplete.tsx          # 결제 완료 화면
    ReviewModal.tsx               # 비공개 평가 모달
  components/dashboard/
    DashboardContent.tsx           # 대시보드 (Realtime 구독)
    OrderCard.tsx                 # 주문 카드 (완료 버튼)
    StatsCards.tsx                # 오늘 통계 카드
  lib/
    supabase/                     # DB 클라이언트
    openai/client.ts              # OpenAI 연동
    payments/toss.ts, stripe.ts   # 결제 연동
    utils/menu.ts                 # getLocalizedName
```

## 환경 변수
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# OpenAI
OPENAI_API_KEY

# 토스페이먼츠
NEXT_PUBLIC_TOSS_CLIENT_KEY
TOSS_SECRET_KEY

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# 앱 URL (선택)
NEXT_PUBLIC_APP_URL
```

## 다음 할 일

### Step C: 인증
사장님 로그인

### Step D: AI 리포트
주간 매출 분석 및 개선 제안

---

## 시작하기 (참고)
```bash
npm install
cp .env.example .env.local   # 위 환경 변수 입력
npm run dev
```
Supabase: `supabase/migrations/20250212000000_initial_schema.sql` 실행  
배포: [docs/CLOUDFLARE_DEPLOY.md](docs/CLOUDFLARE_DEPLOY.md)
