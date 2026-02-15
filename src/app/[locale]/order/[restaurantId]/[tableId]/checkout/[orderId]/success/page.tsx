import { Suspense } from 'react';
import { CheckoutSuccessClient } from './CheckoutSuccessClient';

function SuccessFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <p className="text-gray-500">결제를 확인하는 중...</p>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
