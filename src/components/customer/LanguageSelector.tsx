'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

const locales: { code: 'ko' | 'en' | 'zh' | 'ja'; flag: string }[] = [
  { code: 'ko', flag: '🇰🇷' },
  { code: 'en', flag: '🇺🇸' },
  { code: 'zh', flag: '🇨🇳' },
  { code: 'ja', flag: '🇯🇵' },
];

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function changeLocale(nextLocale: string) {
    const path = pathname.replace(/^\/(ko|en|zh|ja)/, '') || '/';
    const newPath = nextLocale === 'ko' ? path || '/' : `/${nextLocale}${path}`;
    router.push(newPath);
  }

  return (
    <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      {locales.map(({ code, flag }) => (
        <button
          key={code}
          type="button"
          onClick={() => changeLocale(code)}
          title={code}
          className={`rounded-md px-2 py-1 text-lg transition ${
            locale === code ? 'bg-white shadow-sm' : 'hover:bg-white/70'
          }`}
          aria-label={code}
          aria-pressed={locale === code}
        >
          {flag}
        </button>
      ))}
    </div>
  );
}
