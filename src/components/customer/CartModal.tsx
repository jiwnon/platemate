'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { Locale } from '@/types';
import type { MenuItem } from '@/types';
import { getLocalizedName } from '@/lib/utils/menu';

export type CartEntry = { menuItem: MenuItem; quantity: number };

type Props = {
  cart: CartEntry[];
  locale: Locale;
  onClose: () => void;
  onUpdateQuantity: (menuItem: MenuItem, delta: number) => void;
  onPlaceOrder: () => void;
  isSubmitting?: boolean;
};

export function CartModal({
  cart,
  locale,
  onClose,
  onUpdateQuantity,
  onPlaceOrder,
  isSubmitting = false,
}: Props) {
  const t = useTranslations('cartModal');

  const totalPrice = cart.reduce((sum, e) => sum + e.menuItem.price * e.quantity, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="text-lg font-bold text-gray-900">{t('title')}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              aria-label={t('close')}
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <p className="py-8 text-center text-gray-500">{t('empty')}</p>
            ) : (
              <ul className="space-y-3">
                {cart.map(({ menuItem, quantity }) => {
                  const name = getLocalizedName(menuItem, locale);
                  const lineTotal = menuItem.price * quantity;
                  return (
                    <li
                      key={menuItem.id}
                      className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                        {menuItem.image_url ? (
                          <Image
                            src={menuItem.image_url}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized={menuItem.image_url.startsWith('http')}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
                            🍽️
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{name}</p>
                        <p className="text-sm text-primary-600">
                          ₩{menuItem.price.toLocaleString()} × {quantity} = ₩{lineTotal.toLocaleString()}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(menuItem, -1)}
                            disabled={quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 disabled:opacity-40"
                            aria-label="-"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(menuItem, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600"
                            aria-label="+"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between text-lg font-semibold">
                <span className="text-gray-700">{t('total')}</span>
                <span className="text-primary-600">₩{totalPrice.toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={onPlaceOrder}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary-500 py-3 font-medium text-white transition hover:bg-primary-600 disabled:opacity-50"
              >
                {isSubmitting ? t('submitting') : t('placeOrder')}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
