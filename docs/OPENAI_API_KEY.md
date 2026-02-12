# OpenAI API 키 발급 방법

Kurious에서 **AI 도슨트**(메뉴 설명/문화 설명)와 **AI 주간 리포트**를 쓰려면 OpenAI API 키가 필요합니다.

## 1. OpenAI 계정 만들기

1. [OpenAI 플랫폼](https://platform.openai.com) 접속
2. **Sign up**으로 계정 생성 (Google/Apple 로그인 가능)
3. 로그인 후 상단 **API** 메뉴 확인

## 2. API 키 생성

1. [API keys 페이지](https://platform.openai.com/api-keys)로 이동  
   (또는 로그인 후 **Profile 아이콘 → API keys**)
2. **Create new secret key** 클릭
3. 이름 입력 (예: `kurious-dev`) 후 **Create secret key**
4. **키가 한 번만 표시**되므로 반드시 복사해서 안전한 곳에 보관
5. `.env.local`에 넣기:
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
   ```

## 3. 결제 수단 등록 (필수)

- OpenAI API는 사용량만큼 과금됩니다.
- 키를 쓰려면 [Billing](https://platform.openai.com/account/billing)에서 **결제 수단**을 등록해야 합니다.
- 비용 제한을 걸어두려면 **Spending limits**에서 한도 설정 가능합니다.

## 4. 사용량/비용

- **gpt-4o-mini** (Kurious 기본): 상대적으로 저렴 (도슨트·리포트용)
- 사용량은 [Usage](https://platform.openai.com/usage)에서 확인할 수 있습니다.

## 5. 보안

- **API 키는 서버에서만 사용**하세요. (이미 `OPENAI_API_KEY`는 `NEXT_PUBLIC_` 없이 사용 중)
- 키가 노출되면 [API keys](https://platform.openai.com/api-keys)에서 **Revoke** 후 새 키를 발급하세요.

이후 Supabase API 키가 필요하면 말해 주시면 같은 식으로 정리해 드리겠습니다.
