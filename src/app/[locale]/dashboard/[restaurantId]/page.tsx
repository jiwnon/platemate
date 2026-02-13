import { DashboardContent } from '@/components/dashboard/DashboardContent';

type Props = {
  params: Promise<{ locale: string; restaurantId: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { restaurantId } = await params;
  return <DashboardContent restaurantId={restaurantId} />;
}