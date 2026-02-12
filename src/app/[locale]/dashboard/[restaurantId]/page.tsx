type Props = {
  params: Promise<{ restaurantId: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { restaurantId } = await params;
  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold text-primary-600">Dashboard</h1>
      <p className="text-gray-600 mt-2">Restaurant: {restaurantId}</p>
      <p className="text-sm text-gray-500 mt-4">
        실시간 주문, 메뉴 관리, 비공개 평가, AI 리포트가 여기에 구성됩니다.
      </p>
    </main>
  );
}