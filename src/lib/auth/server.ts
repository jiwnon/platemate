import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type AuthUser = { id: string; email?: string };

/**
 * 서버에서 현재 로그인한 사용자 반환. 비로그인 시 null.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? undefined };
}

/**
 * 현재 사용자가 소유한 레스토랑 ID 목록 반환. 비로그인 시 [].
 */
export async function getOwnedRestaurantIds(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('restaurant_owners')
    .select('restaurant_id')
    .eq('user_id', user.id);

  if (error) {
    console.error('[auth] getOwnedRestaurantIds', error);
    return [];
  }
  return (data ?? []).map((r) => r.restaurant_id);
}

const DEFAULT_LOCALE = 'ko';

/**
 * 현재 사용자가 해당 레스토랑에 접근 가능한지 확인.
 * 비로그인 시 locale 기준 /login 리다이렉트, 타 레스토랑 접근 시 403 throw.
 */
export async function assertCanAccessRestaurant(
  restaurantId: string,
  locale: string = DEFAULT_LOCALE
): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const owned = await getOwnedRestaurantIds();
  if (!owned.includes(restaurantId)) {
    redirect(`/${locale}/dashboard`);
  }
  return user;
}

/**
 * 로그인 필수. 비로그인 시 locale 기준 /login 리다이렉트.
 */
export async function requireUser(locale: string = DEFAULT_LOCALE): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  return user;
}
