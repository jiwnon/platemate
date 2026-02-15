# Kurious 프로젝트 진행 상황

## 서비스 개요
외국인 관광객용 QR 주문 시스템 (Korea + Curious)
- 다국어 (한/영/중/일)
- AI 도슨트 (OpenAI GPT-4o-mini)
- 결제: 토스페이먼츠(한국 카드), Stripe(알리페이, 위챗페이, 카드)
- 비공개 평가 → 주간 AI 리포트 (GPT-4o, 캐시)

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
weekly_reports: id, restaurant_id, week_start (DATE), report_json (JSONB), created_at
                UNIQUE(restaurant_id, week_start)
```

## 마이그레이션 (순서대로 실행)
```
supabase/migrations/
  20250212000000_initial_schema.sql    # restaurants, tables, menu_items, orders, order_items, private_reviews
  20250212000001_order_page_fields.sql # tables.table_number, menu_items.category, spicy_level
  20250212000002_ai_docent_columns.sql # AI 도슨트 관련 컬럼
  20250212000003_reviews_food_service_liked.sql  # food_rating, service_rating, liked_items
  20250212000004_weekly_reports.sql    # weekly_reports 테이블
```

## 완료된 기능

### ✅ Step A-1: 메뉴 목록 페이지
- 경로: /[locale]/order/[restaurantId]/[tableId]
- 기능: 메뉴 카드, 카테고리 탭, 장바구니 바
- 컴포넌트: OrderPageContent, OrderMenuCard, CartBar, MenuCard, LanguageSelector

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

### ✅ Step C: 주간 AI 리포트
- API: GET /api/dashboard/[restaurantId]/weekly-report
- 지난 7일 집계: 매출·주문 건수, 메뉴별 판매 상위 5, 평균 평점, 저평점(3점 이하) 의견
- OpenAI GPT-4o로 JSON 리포트 생성: sales_summary, top_insights, recommendations(3), warnings
- 캐시: weekly_reports 테이블, 같은 주(월요일 0시 UTC 기준) 재요청 시 캐시 반환
- 컴포넌트: WeeklyReportButton, WeeklyReportModal (대시보드 상단 "주간 리포트 보기")

## 주요 파일 경로
```
src/
  app/[locale]/
    layout.tsx
    page.tsx                        # 랜딩
    dashboard/[restaurantId]/page.tsx
    order/[restaurantId]/[tableId]/
      page.tsx, loading.tsx, error.tsx, not-found.tsx
      checkout/[orderId]/page.tsx, success/page.tsx, fail/page.tsx
  app/api/
    ai/generate-docent/, ai/route.ts
    dashboard/[restaurantId]/route.ts, weekly-report/route.ts
    orders/create/, [orderId]/route.ts, route.ts
    reviews/create/
    payments/route.ts, toss/confirm/, stripe/create-session|verify-session|webhook/
  components/customer/
    OrderPageContent, OrderMenuCard, CartBar, CartModal
    MenuCard, MenuDetailModal, DocentSection, LanguageSelector
    CheckoutContent, CheckoutComplete, ReviewModal
  components/dashboard/
    DashboardContent, OrderCard, StatsCards, OrderList
    WeeklyReportButton, WeeklyReportModal
  components/shared/
    LanguageSwitcher
  lib/
    supabase/client.ts, server.ts, middleware.ts
    openai/client.ts
    payments/toss.ts, stripe.ts
    i18n/, utils/menu.ts, utils/cn.ts
  types/
    index.ts, database.types.ts
```

## 스크립트
| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | Next.js 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint |
| `npm run preview` | OpenNext 빌드 후 로컬 Cloudflare Worker 실행 |
| `npm run deploy` | OpenNext 빌드 후 Cloudflare 배포 |
| `npm run upload` | 빌드 후 변경분만 Cloudflare 업로드 |
| `npm run cf-typegen` | Wrangler env 타입 생성 |
| `npm run db:generate` | Supabase 타입 생성 (로컬 연결 필요) |
| `npm run db:push` | Supabase 마이그레이션 적용 |

## 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
NEXT_PUBLIC_TOSS_CLIENT_KEY, TOSS_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL  # 선택
```

## 프로젝트 Skills (.agents/skills/)
- **ui-ux-pro-max**: UI/UX 디자인, 팔레트, 타이포, 접근성
- **vercel-react-best-practices**: React/Next 성능 (워터폴, 번들, RSC)
- **supabase-postgres-best-practices**: Postgres/Supabase 쿼리·스키마
- **vercel-react-native-skills**: React Native/Expo (모바일)
- **next-upgrade**: Next.js 버전 업그레이드
- **next-cache-components**: Next.js 16 Cache Components / PPR
- **next-best-practices**: 파일 관례, RSC, 데이터 패턴
- **agent-browser**: 브라우저 자동화
- **vercel-composition-patterns**: React 컴포지션, compound components
- **web-design-guidelines**: Web Interface Guidelines 리뷰
- **find-skills**: agent skill 검색·설치 안내

## 최적화 적용 사항
- **주문 페이지 (order/.../page.tsx)**: restaurant, table, menuItems를 `Promise.all`로 한 번에 조회.
- **GET /api/dashboard/[restaurantId]**: pending 주문과 오늘 통계 조회를 `Promise.all`로 병렬화. tables와 order_items도 병렬 조회.
- **GET /api/dashboard/.../weekly-report**: 캐시 미스 시 orders와 private_reviews를 `Promise.all`로 병렬 조회.
- **결제 success/fail 페이지 (next-best-practices)**: `useSearchParams()` 사용 시 전체 페이지 CSR 방지를 위해 서버 페이지에서 `<Suspense>`로 클라이언트 컴포넌트 감쌈. `CheckoutSuccessClient` / `CheckoutFailClient` 분리.

## 다음 할 일

**🎯 현재 완성도: 60~70%**

- **✅ Step A-1 ~ A-5**: 고객 주문 시스템 (메뉴, AI 도슨트, 결제, 리뷰)
- **✅ Step B**: 사장님 대시보드 (실시간 주문, 통계)
- **✅ Step C**: 주간 AI 리포트 (GPT-4o 분석 + 캐싱)

---

- **🔜 Step D**: 사장님 인증 (로그인/회원가입)
- **🔜 Step E**: 레스토랑/메뉴 관리 (CRUD)
- **🔜 Step F**: PWA 최적화 & 배포

---

## 시작하기
```bash
npm install
cp .env.example .env.local   # 환경 변수 입력
npm run dev
```
Supabase: 마이그레이션 순서대로 SQL 실행 또는 `npm run db:push`  
배포: [docs/CLOUDFLARE_DEPLOY.md](docs/CLOUDFLARE_DEPLOY.md)
