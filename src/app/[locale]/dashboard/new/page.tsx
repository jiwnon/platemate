import { requireUser } from '@/lib/auth/server';
import { NewRestaurantForm } from '@/components/dashboard/NewRestaurantForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewRestaurantPage({ params }: Props) {
  const { locale } = await params;
  await requireUser(locale);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">레스토랑 등록</h1>
        <p className="text-gray-600 mb-6">
          등록된 레스토랑이 없습니다. 아래 정보를 입력해 새 레스토랑을 등록하세요.
        </p>
        <NewRestaurantForm locale={locale} />
      </div>
    </main>
  );
}
