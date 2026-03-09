import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { redirect: redirectTo } = await searchParams;
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">...</div>}>
      <LoginForm locale={locale} redirectTo={redirectTo ?? null} />
    </Suspense>
  );
}
