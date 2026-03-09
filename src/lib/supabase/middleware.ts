import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const DASHBOARD_PATH = '/dashboard';
const LOCALES = ['ko', 'en', 'zh', 'ja'] as const;
const DEFAULT_LOCALE = 'ko';

/**
 * request의 쿠키로 세션 갱신 후, 주어진 response에 쿠키를 반영.
 * dashboard 접근 시 비로그인이면 null을 반환해 리다이렉트할 수 있게 함.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<{ response: NextResponse; user: { id: string } | null }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { response, user: null };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options as Record<string, unknown>)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return { response, user: user ? { id: user.id } : null };
}

export function getLocaleFromPathname(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0];
  return LOCALES.includes(segment as (typeof LOCALES)[number]) ? segment : DEFAULT_LOCALE;
}

export function isDashboardPath(pathname: string): boolean {
  return pathname.includes(DASHBOARD_PATH);
}
