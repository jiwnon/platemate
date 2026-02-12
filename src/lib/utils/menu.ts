import type { Locale } from '@/types';
import type { MenuItem } from '@/types';

/**
 * locale에 맞는 메뉴 이름 반환 (fallback: en → ko)
 */
export function getLocalizedName(item: MenuItem, locale: Locale): string {
  const i18n = item.name_i18n as Record<Locale, string> | undefined;
  if (!i18n) return item.name;

  switch (locale) {
    case 'ko':
      return i18n.ko ?? item.name;
    case 'en':
      return i18n.en ?? i18n.ko ?? item.name;
    case 'zh':
      return i18n.zh ?? i18n.en ?? i18n.ko ?? item.name;
    case 'ja':
      return i18n.ja ?? i18n.en ?? i18n.ko ?? item.name;
    default:
      return item.name;
  }
}
