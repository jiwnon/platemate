'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function OrderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Order');

  useEffect(() => {
    console.error('Order page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <p className="mb-4 text-center text-gray-600">
        {error.message || t('restaurantNotFound')}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-primary-500 px-6 py-3 text-white transition hover:bg-primary-600"
      >
        다시 시도
      </button>
    </div>
  );
}
