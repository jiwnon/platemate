import { createClient } from '@supabase/supabase-js';

/**
 * 서버 전용. Storage 업로드 등 RLS 우회가 필요한 경우에만 사용.
 * API Route에서만 import하고 클라이언트 번들에 포함되지 않도록 주의.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (server only)');
  }
  return createClient(url, serviceRoleKey);
}
