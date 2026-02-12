/**
 * 토스페이먼츠 연동 (한국 결제)
 * 결제 요청/확인 로직은 API Route에서 처리
 */
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;

export function getTossClientKey() {
  return TOSS_CLIENT_KEY ?? '';
}

export function getTossSecretKey() {
  return TOSS_SECRET_KEY ?? '';
}
