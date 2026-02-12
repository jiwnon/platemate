'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function OrderNotFound() {
  const t = useTranslations('Order');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <p className="mb-4 text-center text-gray-600">
        {t('restaurantNotFound')}
      </p>
      <Link
        href="/"
        className="rounded-xl bg-primary-500 px-6 py-3 text-white transition hover:bg-primary-600"
      >
        홈으로
      </Link>
    </div>
  );
}
