'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { DocentContent } from '@/types';
import type { Locale } from '@/types';

type Props = {
  menuItemId: string;
  locale: Locale;
};

export function DocentSection({ menuItemId, locale }: Props) {
  const t = useTranslations('menuDetail');
  const [data, setData] = useState<DocentContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch('/api/ai/generate-docent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId, locale }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Failed to load');
        return json as DocentContent;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('error'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [menuItemId, locale]);

  if (loading) {
    return (
      <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
        <p className="text-sm text-gray-500">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">{t('error')}</p>
        <p className="mt-1 text-xs text-amber-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
    >
      <h4 className="text-sm font-semibold text-gray-700">{t('culturalContext')}</h4>
      <p className="text-sm leading-relaxed text-gray-600">{data.cultural_context}</p>

      <h4 className="text-sm font-semibold text-gray-700">{t('ingredients')}</h4>
      <ul className="flex flex-wrap gap-2">
        {data.ingredients.map((ing, i) => (
          <li
            key={i}
            className="rounded-full bg-white px-3 py-1 text-xs text-gray-600 shadow-sm"
          >
            {ing}
          </li>
        ))}
      </ul>

      <h4 className="text-sm font-semibold text-gray-700">{t('recommendation')}</h4>
      <p className="text-sm leading-relaxed text-gray-600">{data.recommendation}</p>
    </motion.section>
  );
}
