import Link from 'next/link';
import { assertCanAccessRestaurant } from '@/lib/auth/server';
import { RestaurantSettingsContent } from '@/components/dashboard/RestaurantSettingsContent';

type Props = {
  params: Promise<{ locale: string; restaurantId: string }>;
};

export default async function RestaurantSettingsPage({ params }: Props) {
  const { locale, restaurantId } = await params;
  await assertCanAccessRestaurant(restaurantId, locale);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/${locale}/dashboard/${restaurantId}`}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 대시보드
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">레스토랑 기본 정보</h1>
        </div>
        <RestaurantSettingsContent restaurantId={restaurantId} />
      </div>
    </main>
  );
}
