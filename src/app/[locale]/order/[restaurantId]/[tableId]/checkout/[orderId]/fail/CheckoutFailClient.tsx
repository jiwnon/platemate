'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

export function CheckoutFailClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) ?? 'ko';
  const restaurantId = params.restaurantId as string;
  const tableId = params.tableId as string;
  const pathPrefix = locale === 'ko' ? '' : `/${locale}`;
  const code = searchParams.get('code') ?? '';
  const message = searchParams.get('message') ?? '결제가 취소되었거나 실패했습니다.';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-2xl font-bold text-red-600">결제 실패</p>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        {code && <p className="mt-1 text-xs text-gray-400">코드: {code}</p>}
        <Link
          href={`${pathPrefix}/order/${restaurantId}/${tableId}`}
          className="mt-6 inline-block rounded-xl bg-primary-500 px-6 py-3 font-medium text-white transition hover:bg-primary-600"
        >
          메뉴로 돌아가기
        </Link>
      </div>
    </main>
  );
}
