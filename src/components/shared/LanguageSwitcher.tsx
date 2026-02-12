'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

const locales = [
  { code: 'ko' as const, label: '한국어' },
  { code: 'en' as const, label: 'English' },
  { code: 'zh' as const, label: '中文' },
  { code: 'ja' as const, label: '日本語' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function changeLocale(nextLocale: string) {
    const path = pathname.replace(/^\/(ko|en|zh|ja)/, '') || '/';
    const newPath = nextLocale === 'ko' ? path || '/' : `/${nextLocale}${path}`;
    router.push(newPath);
  }

  return (
    <select
      value={locale}
      onChange={(e) => changeLocale(e.target.value)}
      className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm"
    >
      {locales.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}
