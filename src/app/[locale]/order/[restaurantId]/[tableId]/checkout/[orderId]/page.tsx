import { CheckoutComplete } from '@/components/customer/CheckoutComplete';

type Props = {
  params: Promise<{ locale: string; restaurantId: string; tableId: string; orderId: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { locale, restaurantId, tableId, orderId } = await params;
  return (
    <CheckoutComplete
      locale={locale}
      restaurantId={restaurantId}
      tableId={tableId}
      orderId={orderId}
    />
  );
}
