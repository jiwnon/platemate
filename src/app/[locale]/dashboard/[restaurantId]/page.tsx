import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { assertCanAccessRestaurant } from '@/lib/auth/server';

type Props = {
  params: Promise<{ locale: string; restaurantId: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale, restaurantId } = await params;
  await assertCanAccessRestaurant(restaurantId, locale);
  return <DashboardContent restaurantId={restaurantId} locale={locale} />;
}