'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckoutComplete } from '@/components/customer/CheckoutComplete';

type Status = 'confirming' | 'success' | 'error';

export function CheckoutSuccessClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('confirming');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const locale = (params.locale as string) ?? 'ko';
  const restaurantId = params.restaurantId as string;
  const tableId = params.tableId as string;
  const orderId = params.orderId as string;

  const confirm = useCallback(async () => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      const res = await fetch('/api/payments/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.ok === true || data.message === 'Already paid')) {
        setStatus('success');
      } else {
        setErrorMsg((data as { error?: string }).error ?? '결제 확인에 실패했습니다.');
        setStatus('error');
      }
      return;
    }

    const paymentKey = searchParams.get('paymentKey');
    const orderIdFromQuery = searchParams.get('orderId');
    const amountStr = searchParams.get('amount');
    if (!paymentKey || !orderIdFromQuery || !amountStr) {
      setErrorMsg('결제 정보가 없습니다.');
      setStatus('error');
      return;
    }
    const amount = Number(amountStr);
    if (Number.isNaN(amount)) {
      setErrorMsg('잘못된 결제 정보입니다.');
      setStatus('error');
      return;
    }

    const res = await fetch('/api/payments/toss/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId: orderIdFromQuery, amount }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.ok === true || data.message === 'Already paid')) {
      setStatus('success');
    } else {
      setErrorMsg((data as { error?: string }).error ?? '결제 확인에 실패했습니다.');
      setStatus('error');
    }
  }, [searchParams]);

  useEffect(() => {
    confirm();
  }, [confirm]);

  if (status === 'confirming') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-500">결제를 확인하는 중...</p>
      </main>
    );
  }

  if (status === 'error') {
    const pathPrefix = locale === 'ko' ? '' : `/${locale}`;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xl font-bold text-red-600">결제 확인 실패</p>
          <p className="mt-2 text-sm text-gray-600">{errorMsg}</p>
          <a
            href={`${pathPrefix}/order/${restaurantId}/${tableId}`}
            className="mt-6 inline-block rounded-xl bg-primary-500 px-6 py-3 font-medium text-white transition hover:bg-primary-600"
          >
            메뉴로 돌아가기
          </a>
        </div>
      </main>
    );
  }

  return (
    <CheckoutComplete
      locale={locale}
      restaurantId={restaurantId}
      tableId={tableId}
      orderId={orderId}
    />
  );
}
