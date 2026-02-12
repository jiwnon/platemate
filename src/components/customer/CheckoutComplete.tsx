'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

type Props = {
  locale: string;
  restaurantId: string;
  tableId: string;
  orderId: string;
};

export function CheckoutComplete({ locale, restaurantId, tableId, orderId }: Props) {
  const t = useTranslations('checkout');
  const pathPrefix = locale === 'ko' ? '' : `/${locale}`;
  const backUrl = `${pathPrefix}/order/${restaurantId}/${tableId}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-2xl font-bold text-primary-600">{t('complete')}</p>
        <p className="mt-2 text-sm text-gray-500">Order ID: {orderId}</p>
        <p className="mt-4 text-sm text-gray-600">
          결제는 다음 단계에서 연동 예정입니다.
        </p>
        <Link
          href={backUrl}
          className="mt-6 inline-block rounded-xl bg-primary-500 px-6 py-3 font-medium text-white transition hover:bg-primary-600"
        >
          메뉴로 돌아가기
        </Link>
      </div>
    </main>
  );
}
