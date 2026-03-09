import Link from 'next/link';
import { assertCanAccessRestaurant } from '@/lib/auth/server';
import { TableManageContent } from '@/components/dashboard/TableManageContent';

type Props = {
  params: Promise<{ locale: string; restaurantId: string }>;
};

export default async function TablesManagePage({ params }: Props) {
  const { locale, restaurantId } = await params;
  await assertCanAccessRestaurant(restaurantId, locale);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/${locale}/dashboard/${restaurantId}`}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 대시보드
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">테이블 & QR코드 관리</h1>
        </div>
        <TableManageContent restaurantId={restaurantId} locale={locale} />
      </div>
    </main>
  );
}
