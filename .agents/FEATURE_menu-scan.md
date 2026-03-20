# 기능 계획서: 메뉴판 촬영 → 메뉴 자동등록

> 작성: Claude (claude.ai, 2026-03-20)  
> 대상 브랜치: main  
> 관련 이슈: 예창패 2026 서류용 신규 기능 — "AI 메뉴 자동등록"

---

## 목적

사장님이 기존 종이 메뉴판을 스마트폰 카메라로 찍으면,  
GPT-4o Vision이 메뉴명·가격·카테고리를 자동으로 인식해  
한 번의 확인으로 메뉴 일괄 등록까지 완료되는 기능.

초기 설정 마찰을 없애는 것이 핵심.  
현재 메뉴 수동 입력 → 이미지 한 장으로 대체.

---

## 코드베이스 현황 (작업 전 파악된 내용)

### 권한 구조
- `restaurant_owners` 테이블 (user_id ↔ restaurant_id, M:M)
- `getOwnedRestaurantIds()` → `lib/auth/server.ts`
- 모든 메뉴 API는 소유권 검증 후 접근. 다른 사장님 데이터와 완전 분리됨.
- `assertCanAccessRestaurant(restaurantId, locale)` 사용 가능

### 기존 메뉴 등록 흐름
```
POST /api/dashboard/[restaurantId]/menu
  body: { name, description, price, category, image_url, is_available, spicy_level }
  → translateMenuItem() 호출 (GPT-4o-mini, lib/openai/client.ts)
  → name_i18n / description_i18n JSONB 자동 저장
```

### OpenAI 클라이언트 패턴 (lib/openai/client.ts)
- `getClient()` — OPENAI_API_KEY 로드
- `response_format: { type: 'json_object' }` 패턴 이미 사용 중
- GPT-4o Vision은 같은 클라이언트로 `model: 'gpt-4o'` + `content: [image_url, text]` 형식 사용

### 이미지 업로드 패턴
- `POST /api/dashboard/[restaurantId]/menu/upload` 이미 존재
- Supabase Storage 버킷: `menu-images` (public)
- `FormData`로 파일 전송 → Storage 업로드 → public URL 반환

### UI 패턴 (MenuManageContent.tsx)
- 상단에 "메뉴 추가" 버튼 1개 존재
- 모달 기반 폼 (`MenuFormModal`)
- `fetch` + `useState` 패턴, Tailwind CSS

---

## 구현 범위

### 1. API Route 신규 생성
**경로:** `src/app/api/dashboard/[restaurantId]/menu/scan/route.ts`

```
POST /api/dashboard/[restaurantId]/menu/scan
  Content-Type: multipart/form-data
  body: { image: File }

  1. 권한 확인: getOwnedRestaurantIds()
  2. 이미지를 base64로 변환
  3. GPT-4o Vision 호출 → 메뉴 목록 JSON 반환
  4. 파싱 결과를 그대로 응답 (DB 저장 안 함 — 미리보기용)

Response:
  { items: [{ name, price, description, category }] }
```

**GPT-4o Vision 프롬프트 방향:**
```
system: "You are a menu OCR assistant for a Korean restaurant app.
Extract all menu items from the image.
Respond ONLY with valid JSON: { \"items\": [{ \"name\": string, \"price\": number, \"description\": string, \"category\": \"main\"|\"side\"|\"drink\" }] }
- price: number in KRW (Korean Won), 0 if not visible
- category: guess from context (main=밥/면/고기, side=반찬/튀김, drink=음료/주류)
- description: empty string if not visible
- name: use the original Korean text from the image"

user: [이미지 base64 + "이 메뉴판에서 메뉴를 추출해 주세요."]
```

**에러 처리:**
- 이미지 없음 → 400
- GPT 응답이 JSON 파싱 실패 → 500, `{ error: 'Failed to parse menu from image' }`
- items 배열이 비어있어도 200 반환 (빈 배열, UI에서 "인식된 메뉴 없음" 처리)

---

### 2. lib/openai/client.ts 함수 추가
**함수명:** `scanMenuFromImage`

```typescript
export async function scanMenuFromImage(
  imageBase64: string,
  mimeType: string  // 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<Array<{ name: string; price: number; description: string; category: string }>>
```

- 기존 `getClient()` 활용
- `model: 'gpt-4o'` (Vision 지원)
- `response_format: { type: 'json_object' }` 사용
- 파싱 실패 시 빈 배열 반환 (graceful fallback — `translateMenuItem` 패턴 참고)

---

### 3. UI 수정 (MenuManageContent.tsx)

**버튼 추가:**  
기존 "메뉴 추가" 버튼 옆에 "📷 메뉴판으로 등록" 버튼 추가

**새 모달: `MenuScanModal`**  
(같은 파일 하단에 추가, `MenuFormModal` 패턴 참고)

```
[단계 1] 이미지 선택
  - <input type="file" accept="image/*" capture="environment">
  - capture="environment" → 모바일에서 카메라 직접 열림
  - 선택 즉시 POST /api/dashboard/[restaurantId]/menu/scan 호출
  - 로딩 중: "메뉴판을 분석하고 있어요…" 표시

[단계 2] 결과 미리보기
  - 인식된 메뉴 목록 테이블 표시 (이름, 가격, 카테고리)
  - 각 항목: 이름·가격·카테고리 인라인 수정 가능 (input)
  - 항목별 체크박스 (기본값: 전체 선택)
  - 하단: "선택한 메뉴 등록하기" 버튼

[단계 3] 일괄 등록
  - 체크된 항목만 순서대로 POST /api/dashboard/[restaurantId]/menu 호출
  - 기존 translateMenuItem() 자동 실행됨 (API 내부에서 처리)
  - 진행 표시: "3/5 등록 중…"
  - 완료 시 onSaved() 호출 → 메뉴 목록 리로드
```

**인식 실패 시 UX:**
- items 빈 배열 → "메뉴를 인식하지 못했어요. 더 밝고 선명한 사진으로 다시 시도해 주세요." + 재촬영 버튼

---

## 파일 변경 요약

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `src/app/api/dashboard/[restaurantId]/menu/scan/route.ts` | **신규** | Vision API 호출, 메뉴 파싱 |
| `src/lib/openai/client.ts` | **수정** | `scanMenuFromImage()` 함수 추가 |
| `src/components/dashboard/MenuManageContent.tsx` | **수정** | 스캔 버튼 + `MenuScanModal` 추가 |

---

## 주의사항

- `route.ts`에서 이미지를 Supabase Storage에 **저장하지 않아도 됨** — base64를 GPT에 직접 전달
- 파일 크기 제한: 클라이언트에서 5MB 이상이면 업로드 전 경고 (GPT Vision 제한)
- Cloudflare Workers 환경이므로 `Buffer`는 사용 불가 → `Uint8Array` + `btoa()` 또는 Web API 사용
- 기존 `translateMenuItem()`은 메뉴 등록 시 자동 호출되므로 scan API에서는 번역 불필요

---

## 예창패 서류 연계 포인트

이 기능은 사업계획서 **"실현가능성 > AI 활용"** 항목에서  
"온보딩 마찰 제거를 위한 AI 메뉴 자동인식" 사례로 기재 예정.

> "사장님은 기존 종이 메뉴판 사진 한 장으로 디지털 메뉴 등록을 완료할 수 있습니다.  
> GPT-4o Vision이 메뉴명·가격·카테고리를 자동 인식하고,  
> 등록 즉시 5개 언어로 번역되어 외국인 손님에게 노출됩니다."
