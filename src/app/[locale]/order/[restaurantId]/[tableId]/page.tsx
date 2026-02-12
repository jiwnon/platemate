type Props = {
  params: Promise<{ restaurantId: string; tableId: string }>;
};

export default async function OrderPage({ params }: Props) {
  const { restaurantId, tableId } = await params;
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-primary-600">Order</h1>
      <p className="text-gray-600 mt-2">
        Restaurant: {restaurantId} / Table: {tableId}
      </p>
      <p className="text-sm text-gray-500 mt-4">
        메뉴, 장바구니, AI 도슨트, 결제 UI가 여기에 구성됩니다.
      </p>
    </main>
  );
}
