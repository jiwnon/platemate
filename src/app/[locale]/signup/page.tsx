import { SignUpForm } from '@/components/auth/SignUpForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SignUpPage({ params }: Props) {
  const { locale } = await params;
  return <SignUpForm locale={locale} />;
}
