'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';

type OrderInfo = {
  id: string;
  total_amount: number;
  payment_status: string;
};

type Props = {
  locale: string;
  restaurantId: string;
  tableId: string;
  orderId: string;
  tossClientKey: string;
};

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (
        method: string,
        params: { orderId: string; amount: number; orderName: string; successUrl: string; failUrl: string }
      ) => Promise<void>;
    };
  }
}

export function CheckoutContent({
  locale,
  restaurantId,
  tableId,
  orderId,
  tossClientKey,
}: Props) {
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load order');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const pathPrefix = locale === 'ko' ? '' : `/${locale}`;

  const handleTossPay = () => {
    if (!order || order.payment_status === 'paid') return;
    const TossPayments = window.TossPayments;
    if (!TossPayments || !tossClientKey) {
      setError('결제를 불러올 수 없습니다. 환경 설정을 확인해 주세요.');
      return;
    }
    const basePath = `${pathPrefix}/order/${restaurantId}/${tableId}/checkout/${orderId}`;
    const successUrl = `${window.location.origin}${basePath}/success`;
    const failUrl = `${window.location.origin}${basePath}/fail`;
    setPaying(true);
    setError(null);
    const client = TossPayments(tossClientKey);
    client
      .requestPayment('카드', {
        orderId: order.id,
        amount: order.total_amount,
        orderName: `주문_${orderId.slice(0, 8)}`,
        successUrl,
        failUrl,
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : '결제 창을 열 수 없습니다.');
        setPaying(false);
      });
  };


  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-500">주문 정보를 불러오는 중...</p>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-red-600">{error}</p>
        <Link href={`${pathPrefix}/order/${restaurantId}/${tableId}`} className="mt-4 text-primary-600 underline">
          메뉴로 돌아가기
        </Link>
      </main>
    );
  }

  if (!order) return null;

  if (order.payment_status === 'paid') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary-600">이미 결제된 주문입니다.</p>
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

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v1/payment"
        strategy="afterInteractive"
      />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">결제</h1>
          <div className="mt-4 flex justify-between text-gray-700">
            <span>결제 금액</span>
            <span className="font-semibold">₩{order.total_amount.toLocaleString()}</span>
          </div>

          <p className="mt-4 text-sm font-medium text-gray-700">결제 수단</p>
          <div className="mt-2 space-y-2">
            <button
              type="button"
              onClick={handleTossPay}
              disabled={paying}
              className="w-full rounded-xl border-2 border-blue-600 bg-white py-3 font-medium text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
            >
              한국 카드 (토스페이먼츠)
            </button>
            {/* 외국인 결제 (Stripe): 사업자 등록 후 활성화 예정 */}
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <Link
            href={`${pathPrefix}/order/${restaurantId}/${tableId}`}
            className="mt-6 block text-center text-sm text-gray-500 underline"
          >
            메뉴로 돌아가기
          </Link>
        </div>
      </main>
    </>
  );
}
