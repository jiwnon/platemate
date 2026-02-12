'use client';

import { useTranslations } from 'next-intl';

type Props = {
  itemCount: number;
  totalPrice: number;
  restaurantId: string;
  tableId: string;
  onOrder: () => void;
};

export function CartBar({ itemCount, totalPrice, restaurantId, tableId, onOrder }: Props) {
  const t = useTranslations('Order');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-2xl" aria-hidden>
              🛒
            </span>
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-500 px-1 text-xs font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          <span className="font-semibold text-gray-900">
            ₩{totalPrice.toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          onClick={onOrder}
          disabled={itemCount === 0}
          data-restaurant-id={restaurantId}
          data-table-id={tableId}
          className="rounded-xl bg-primary-500 px-6 py-3 font-medium text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary-500"
        >
          {t('placeOrder')}
        </button>
      </div>
    </div>
  );
}
