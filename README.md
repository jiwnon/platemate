# Platemate

**Pl8m8** — 식당 QR코드 하나로 주문·결제·리뷰까지

테이블 QR코드를 스캔하면 다국어 메뉴 확인, AI 도슨트, 간편 결제가 한 번에.
사장님은 손님의 비공개 리뷰를 AI가 요약한 리포트로 한눈에 확인할 수 있습니다.

- 🍽️ **QR 주문 & 결제** — 테이블에서 바로 주문하고 토스페이먼츠/Stripe로 결제
- 🤖 **AI 메뉴 도슨트** — 메뉴 상세보기에서 AI가 재료·특징·페어링을 설명
- 📊 **비공개 리뷰 & AI 리포트** — 손님 리뷰를 AI가 분석해 사장님께 주간 리포트 제공

## 배포 URL

<!-- 배포 후 아래 URL을 실제 주소로 교체하세요 -->
- **Live:** https://platem8.xyz

## 스크린샷

<!-- 앱 스크린샷을 추가할 때 아래 placeholder를 이미지로 교체하세요 -->
| 랜딩 | 주문 화면 | 사장님 대시보드 |
|------|-----------|-----------------|
| (스크린샷) | (스크린샷) | (스크린샷) |

## 기술 스택

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + Realtime)
- **AI:** OpenAI (도슨트, 주간 리포트)
- **Payment:** 토스페이먼츠, Stripe
- **PWA:** next-pwa
- **i18n:** next-intl (한/영/중/일)
- **배포:** Cloudflare (OpenNext 어댑터)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에 Supabase, OpenAI, 결제 키 등을 입력하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

### 4. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
3. Supabase SQL Editor에서 `supabase/migrations/20250212000000_initial_schema.sql` 실행

(로컬에 Supabase CLI 설치 시 `supabase link` 후 `npm run db:push` 사용 가능)

### 5. Cloudflare 배포

- **배포 방법:** [docs/CLOUDFLARE_DEPLOY.md](docs/CLOUDFLARE_DEPLOY.md) 참고
- **OpenAI API 키 발급:** [docs/OPENAI_API_KEY.md](docs/OPENAI_API_KEY.md) 참고
- Supabase API 키가 필요하면 말해 주세요.

## Cursor + Agent Skills

이 레포에는 **`.agents/skills/`** 가 포함되어 있습니다. Cursor에서 레포를 클론하면 동일한 Agent Skills(Next.js, React, Supabase 등 베스트 프랙티스)가 적용된 상태로 개발할 수 있습니다. 별도 설치 없이 `npm install` 후 바로 사용하면 됩니다.

- 스킬 목록·역할: [PROGRESS.md#프로젝트-Skills](PROGRESS.md) 참고.

## 프로젝트 구조

```
src/
├── app/
│   ├── [locale]/              # 다국어 라우팅 (ko, en, zh, ja)
│   │   ├── order/[restaurantId]/[tableId]/  # 손님 주문
│   │   ├── dashboard/[restaurantId]/       # 사장님 대시보드
│   │   └── page.tsx                        # 랜딩
│   └── api/                   # API Routes (orders, payments, ai)
├── components/
│   ├── customer/              # 손님용
│   ├── dashboard/             # 사장님용
│   └── shared/               # 공통
├── lib/
│   ├── supabase/             # Supabase 클라이언트
│   ├── i18n/                 # next-intl 설정
│   ├── openai/               # AI 도슨트
│   ├── payments/             # 토스, Stripe
│   └── utils/
└── types/
```

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | Next.js 프로덕션 빌드 |
| `npm run start` | Next.js 프로덕션 서버 실행 |
| `npm run preview` | OpenNext 빌드 후 로컬에서 Cloudflare Worker로 실행 |
| `npm run deploy` | OpenNext 빌드 후 Cloudflare에 배포 |
| `npm run upload` | 빌드 후 새 버전만 Cloudflare에 업로드 |
| `npm run cf-typegen` | Wrangler env 타입 생성 |
| `npm run lint` | ESLint 실행 |
| `npm run db:generate` | Supabase 타입 생성 (로컬 Supabase 연결 필요) |

## 라이선스

Private
