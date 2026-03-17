# Platemate — 프로젝트 컨텍스트

> AI 에이전트(Cursor, Claude Code 등)가 이 프로젝트를 빠르게 파악하기 위한 문서입니다.

## 서비스 한 줄 요약

외국인 관광객을 위한 **QR 코드 기반 테이블 주문 시스템**.
손님은 QR을 스캔해 본인 언어(한/영/중/일/러)로 메뉴를 보고 AI 도슨트의 설명을 듣고 주문·결제합니다.
리뷰 제출 시 재방문 10% 할인 쿠폰이 자동 발급되며 카카오톡·LINE·이메일로 공유할 수 있습니다.
사장님은 대시보드에서 실시간 주문 관리, 리뷰 분석, AI 주간 리포트로 매장을 운영합니다.

- **배포 URL**: https://platem8.xyz
- **GitHub**: https://github.com/jiwnon/platemate (main 브랜치)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) + React 19 + TypeScript |
| DB / Auth / Realtime | Supabase (PostgreSQL) |
| 스타일 | Tailwind CSS + Framer Motion |
| 국제화 | next-intl (ko / en / zh / ja / ru) |
| AI | OpenAI GPT-4o-mini (도슨트), GPT-4o (주간 리포트) |
| 결제 | 토스페이먼츠 (한국 카드), Stripe (해외 — 현재 UI 비활성화) |
| 배포 | Cloudflare Workers + OpenNext 어댑터 |
| 모바일 | Capacitor (Android 앱, 패키지 `com.platemate.app`) + PWA |

---

## 손님 흐름

```
QR 스캔
  → /[locale]/order/[restaurantId]/[tableId]   # 메뉴 목록 (언어 자동 선택)
  → 메뉴 카드 클릭 → AI 도슨트 모달
  → 장바구니 → POST /api/orders/create
  → /[locale]/order/.../checkout/[orderId]     # 결제 (토스페이먼츠)
  → .../checkout/[orderId]/success             # 결제 완료
  → 30분 후 ReviewModal 자동 표시
  → 리뷰 제출 → 쿠폰 발급 (CouponModal)
```

## 사장님 흐름

```
/[locale]/login  →  Supabase Auth
  → /[locale]/dashboard/[restaurantId]         # 실시간 주문 관리 (Supabase Realtime)
  → /[locale]/dashboard/[restaurantId]/menu    # 메뉴 관리
  → /[locale]/dashboard/[restaurantId]/tables  # 테이블 & QR 코드
  → /[locale]/dashboard/[restaurantId]/reviews  # 리뷰 분석 대시보드
  → /[locale]/dashboard/[restaurantId]/settings  # 레스토랑 설정
```

---

## DB 스키마

```sql
restaurants
  id, name, slug, logo_url, name_i18n (JSONB), created_at, updated_at

tables
  id, restaurant_id, name, table_number, qr_code, created_at, updated_at

menu_items
  id, restaurant_id, name, description, name_i18n (JSONB), description_i18n (JSONB),
  price, image_url, ai_docent_ko/en/zh/ja/ru, category, spicy_level,
  sort_order, is_available, created_at, updated_at
  -- name_i18n/description_i18n: 메뉴 저장 시 GPT-4o-mini가 자동으로 5개 언어로 번역

orders
  id, restaurant_id, table_id, status, total_amount, payment_status,
  locale, payment_provider, payment_key,
  coupon_code, discount_amount,
  created_at, updated_at

order_items
  id, order_id, menu_item_id, quantity, unit_price, options, created_at

private_reviews
  id, order_id, restaurant_id, rating, food_rating, service_rating,
  comment, liked_items (JSONB), created_at

coupons
  id, code (UNIQUE, 형식: PM-XXXX-XXXX), restaurant_id, review_order_id,
  discount_percent (default 10), is_used, used_at, used_order_id,
  expires_at (생성 후 1년), created_at

weekly_reports
  id, restaurant_id, week_start (DATE), report_json (JSONB), created_at
  UNIQUE(restaurant_id, week_start)

restaurant_owners
  restaurant_id, user_id, role, created_at, updated_at

push_tokens
  id, user_id, token, platform, created_at
```

---

## 마이그레이션 파일

```
supabase/migrations/
  20250212000000_initial_schema.sql
  20250212000001_order_page_fields.sql
  20250212000002_ai_docent_columns.sql
  20250212000003_reviews_food_service_liked.sql
  20250212000004_weekly_reports.sql
  20250212000005_restaurant_owners.sql
  20260313000001_push_tokens.sql
  20260317000001_coupons.sql
  20260317000002_add_ru_locale.sql
```

---

## API 라우트 전체 목록

```
POST   /api/orders/create
GET    /api/orders/[orderId]
PATCH  /api/orders/[orderId]                         # status 업데이트

POST   /api/reviews/create                           # 리뷰 저장 + 쿠폰 자동 발급
POST   /api/coupons/apply                            # 쿠폰 검증 + 주문 할인 적용

POST   /api/ai/generate-docent                       # GPT-4o-mini 도슨트 생성 & DB 저장

POST   /api/payments/toss/confirm
POST   /api/payments/stripe/create-session
POST   /api/payments/stripe/verify-session
POST   /api/payments/stripe/webhook

GET    /api/dashboard/restaurants                    # 로그인 사용자의 레스토랑 목록
POST   /api/dashboard/restaurants                    # 신규 레스토랑 등록

GET    /api/dashboard/[restaurantId]                 # 메뉴·테이블·주문·통계 일괄
PATCH  /api/dashboard/[restaurantId]                 # 레스토랑 정보 수정
POST   /api/dashboard/[restaurantId]/restaurant/upload

POST   /api/dashboard/[restaurantId]/menu
PATCH  /api/dashboard/[restaurantId]/menu/[menuItemId]
DELETE /api/dashboard/[restaurantId]/menu/[menuItemId]
POST   /api/dashboard/[restaurantId]/menu/upload

POST   /api/dashboard/[restaurantId]/tables
PATCH  /api/dashboard/[restaurantId]/tables/[tableId]
DELETE /api/dashboard/[restaurantId]/tables/[tableId]
GET    /api/dashboard/[restaurantId]/tables/[tableId]/qr   # QR PNG 다운로드

GET    /api/dashboard/[restaurantId]/reviews          # 리뷰 분석 (점수 분포, TOP5 메뉴, 최근 리뷰)
GET    /api/dashboard/[restaurantId]/weekly-report   # GPT-4o 주간 리포트 (캐시)
```

---

## 주요 파일 경로

```
src/
  app/
    [locale]/
      page.tsx                          # 랜딩
      login/page.tsx
      signup/page.tsx
      dashboard/
        page.tsx                        # 레스토랑 선택 (1개면 자동 이동)
        new/page.tsx
        [restaurantId]/
          page.tsx                      # 실시간 주문 대시보드
          menu/page.tsx
          tables/page.tsx
          reviews/page.tsx              # 리뷰 분석 대시보드
          settings/page.tsx
      order/[restaurantId]/[tableId]/
        page.tsx                        # 메뉴 목록
        checkout/[orderId]/
          page.tsx                      # 결제
          success/page.tsx
          fail/page.tsx
    api/                                # 위 API 목록 참고

  components/
    customer/
      OrderPageContent.tsx              # 메뉴 목록 메인
      MenuDetailModal.tsx               # 메뉴 상세 + AI 도슨트
      CartModal.tsx
      CheckoutContent.tsx               # 결제 (쿠폰 입력 포함)
      CheckoutComplete.tsx              # 결제 완료 + 리뷰 타이머
      ReviewModal.tsx                   # 리뷰 작성
      CouponModal.tsx                   # 쿠폰 발급 팝업 (이미지 저장·공유)
    dashboard/
      DashboardContent.tsx              # 실시간 주문 관리
      OrderCard.tsx                     # 주문 카드 (손님 국적 뱃지 포함)
      MenuManageContent.tsx
      TableManageContent.tsx
      ReviewsDashboardContent.tsx       # 리뷰 분석 (점수 링, 분포, TOP5, 최근 리뷰)
      RestaurantSettingsContent.tsx
      WeeklyReportModal.tsx
    auth/
      LoginForm.tsx
      SignUpForm.tsx

  lib/
    supabase/client.ts                  # 브라우저용
    supabase/server.ts                  # 서버 컴포넌트·API Route용
    supabase/admin.ts                   # RLS 우회 (service role key, 서버 전용)
    supabase/middleware.ts
    auth/server.ts                      # getCurrentUser, assertCanAccessRestaurant 등
    openai/client.ts
    payments/toss.ts
    payments/stripe.ts
    i18n/routing.ts                     # 지원 로케일 정의

  types/
    index.ts                            # Restaurant, MenuItem, Order 등 공통 타입
    database.types.ts                   # Supabase 자동 생성 타입
```

---

## 주요 동작 특이사항

**인증 & 권한**
- 사장님 전용: Supabase Auth (이메일/비밀번호)
- `/dashboard` 하위는 미들웨어가 비로그인 시 `/[locale]/login`으로 리다이렉트
- `assertCanAccessRestaurant(restaurantId, locale)`: restaurant_owners 확인, 무권한 시 403

**Supabase Realtime**
- `orders` 테이블 복제 활성화 필요: `ALTER PUBLICATION supabase_realtime ADD TABLE orders;`
- DashboardContent가 채널 구독 → 신규 주문 실시간 표시

**AI 도슨트**
- 메뉴 상세 모달 진입 시 `ai_docent_[locale]` 컬럼 확인
- 없으면 GPT-4o-mini 생성 후 DB 저장 (이후 요청은 캐시 반환)

**쿠폰 시스템**
- 리뷰 제출 → `PM-XXXX-XXXX` 형식 코드 생성 → coupons 테이블 저장 → 응답에 포함
- 결제 화면에서 코드 입력 → `POST /api/coupons/apply` → orders.discount_amount 업데이트
- 토스페이먼츠에 `total_amount - discount_amount` 전달

**결제**
- 토스페이먼츠: 활성화 (테스트 키 사용 중)
- Stripe: 코드는 완성, UI에서 임시 비활성화 (`CheckoutContent.tsx` 주석 해제로 활성화)

**이미지 저장소**
- Supabase Storage 버킷: `menu-images` (public)
- 메뉴 이미지: `menu-images/{restaurantId}/{filename}`
- 로고: `menu-images/logos/{restaurantId}/{filename}`

**i18n**
- URL 구조: `/ko/...`, `/en/...`, `/zh/...`, `/ja/...`, `/ru/...`
- 기본 로케일(ko)은 경로 프리픽스 없이도 동작 (`pathPrefix = locale === 'ko' ? '' : '/${locale}'`)
- 번역 파일: `public/locales/{locale}.json` (ko/en/zh/ja/ru)

**메뉴 자동 다국어 번역**
- 메뉴 등록·수정 시 `translateMenuItem()` 호출 (GPT-4o-mini)
- 입력 언어 자동 감지 → 5개 언어(한/영/중/일/러)로 번역 → `name_i18n`, `description_i18n` JSONB 저장
- 오류 시 graceful fallback (원본 유지)

**손님 국적 뱃지**
- 손님 주문 시 브라우저 locale을 `orders.locale`에 저장
- 대시보드 주문 카드에 국기 + 언어명 뱃지 표시 (🇰🇷한국어 / 🇺🇸English / 🇨🇳中文 / 🇯🇵日本語 / 🇷🇺Русский)

**쿠폰 카카오톡 공유**
- CouponModal: 이미지 저장(Canvas PNG) / Web Share API / 카카오톡 / LINE / 이메일
- Kakao JS SDK (`2.7.4`) 동적 로드, 미초기화 시 클립보드 복사 폴백
- `NEXT_PUBLIC_KAKAO_JS_KEY` 환경 변수 필요

---

## 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

OPENAI_API_KEY

NEXT_PUBLIC_TOSS_CLIENT_KEY
TOSS_SECRET_KEY

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   # 현재 미사용
STRIPE_SECRET_KEY                    # 현재 미사용
STRIPE_WEBHOOK_SECRET                # 현재 미사용

NEXT_PUBLIC_KAKAO_JS_KEY             # 카카오 JS SDK 키 (developers.kakao.com)

NEXT_PUBLIC_APP_URL                  # https://platem8.xyz
```

Cloudflare Workers 배포 시 `.dev.vars` 또는 Cloudflare Dashboard → Workers → Settings → Variables에 동일하게 설정.

---

## 개발 명령어

```bash
npm run dev          # 로컬 개발 서버
npm run build        # Next.js 프로덕션 빌드
npm run deploy       # OpenNext 빌드 + Cloudflare Workers 배포
npm run db:push      # Supabase 마이그레이션 적용 (PowerShell에서 실행)
npm run db:generate  # database.types.ts 재생성
npm run cap:build    # Android 앱 빌드 (build + cap sync)
```
