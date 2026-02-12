# Cloudflare 배포 가이드 (Kurious)

Next.js 앱을 **OpenNext Cloudflare** 어댑터로 빌드해 Cloudflare Workers/Pages에 배포하는 방법입니다.

## 사전 준비

- Node.js 18+
- Cloudflare 계정
- (선택) Wrangler 로그인: `npx wrangler login`

## 1. 로컬에서 배포 (CLI)

### 패키지 설치

```bash
npm install
```

### 환경 변수 (배포 전 필수)

배포된 앱이 동작하려면 **Cloudflare 대시보드**에서 아래 환경 변수를 설정해야 합니다.

**Workers & Pages → 해당 프로젝트 → Settings → Variables and Secrets**

| 변수명 | 설명 | 비밀 여부 |
|--------|------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | **Yes** (Secret) |
| `OPENAI_API_KEY` | OpenAI API 키 | **Yes** (Secret) |
| `NEXT_PUBLIC_APP_URL` | 배포된 앱 URL (예: https://kurious.xxx.pages.dev) | No |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | (선택) 토스 클라이언트 키 | No |
| `TOSS_SECRET_KEY` | (선택) 토스 시크릿 | **Yes** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (선택) Stripe publishable key | No |
| `STRIPE_SECRET_KEY` | (선택) Stripe secret | **Yes** |
| `STRIPE_WEBHOOK_SECRET` | (선택) Stripe webhook secret | **Yes** |

- **Secret** 항목은 "Encrypt" 체크 후 입력합니다.
- Supabase 키가 필요하면 말해 주시면 발급/설정 방법 안내해 드립니다.

### 빌드 및 배포

```bash
# 한 번에 빌드 + 배포
npm run deploy
```

최초 배포 시 Wrangler가 프로젝트를 Cloudflare에 연결할 수 있도록 안내합니다.

### 로컬에서 Cloudflare와 동일한 환경으로 실행

```bash
# .dev.vars 준비 (값은 .dev.vars.example 참고)
cp .dev.vars.example .dev.vars
# .dev.vars 에 위 환경 변수 값 채우기

npm run preview
```

## 2. GitHub/GitLab 연동 (CI/CD)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. **Create application** → **Connect to Git**
3. 저장소 선택 후 **Begin setup**
4. **Build configuration**:
   - Framework preset: **None** (또는 Next.js 있으면 선택)
   - Build command: `npm run deploy` 가 아닌 **OpenNext 전용** 사용  
     → 공식 문서: [Cloudflare Next.js](https://developers.cloudflare.com/pages/framework-guides/nextjs/)  
     → 보통 **Build command**: `npx opennextjs-cloudflare build`  
     → **Build output directory**: `.open-next` 또는 안내하는 대로
   - Node version: **18** 이상
5. **Environment variables**: 위 표의 변수들을 **Build** 및 **Runtime** 구분에 맞게 입력
   - `NEXT_PUBLIC_*` → 빌드 시 필요 (Build variables)
   - 나머지(OPENAI_API_KEY 등) → 런타임 필요 (Variables / Secrets)
6. 저장 후 푸시하면 자동 빌드·배포됩니다.

(정확한 필드명은 Cloudflare UI가 바뀌어도 “Build command / Output dir / Env vars”만 맞추면 됩니다.)

## 3. 스크립트 요약

| 명령 | 설명 |
|------|------|
| `npm run dev` | Next.js 로컬 개발 (일반 개발) |
| `npm run build` | Next.js 빌드만 |
| `npm run preview` | OpenNext 빌드 후 로컬에서 Worker로 실행 |
| `npm run deploy` | OpenNext 빌드 후 Cloudflare에 배포 |
| `npm run upload` | 빌드 후 새 버전만 업로드 (설정은 유지) |
| `npm run cf-typegen` | Wrangler env 타입 생성 (`cloudflare-env.d.ts`) |

## 4. 로컬 개발 vs 배포

- **일상 개발**: `npm run dev` (Next.js만 사용, `.env.local` 사용)
- **배포 전 확인**: `npm run preview` (Cloudflare Worker 환경, `.dev.vars` 사용)
- **실제 배포**: Cloudflare 대시보드에 환경 변수 설정 후 `npm run deploy` 또는 Git 푸시

## 5. 문제 해결

- **Worker 크기 제한**: Free 플랜 약 3MB. 무료 한도 초과 시 Paid 플랜 또는 코드/번들 최적화 필요.
- **환경 변수 미적용**: 대시보드에서 Variables/Secrets 저장 후 재배포.
- **이미지 최적화**: Cloudflare Images 바인딩 사용 시 [OpenNext Image 가이드](https://opennext.js.org/cloudflare/howtos/image) 참고.

Supabase API 키가 필요하면 말해 주세요.
