import { Suspense } from 'react';
import { CheckoutFailClient } from './CheckoutFailClient';

function FailFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <p className="text-gray-500">로딩 중...</p>
    </main>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={<FailFallback />}>
      <CheckoutFailClient />
    </Suspense>
  );
}
