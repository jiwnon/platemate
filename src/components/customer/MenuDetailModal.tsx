'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { MenuItem } from '@/types';
import type { Locale } from '@/types';
import { getLocalizedName } from '@/lib/utils/menu';
import { DocentSection } from './DocentSection';

type Props = {
  menu: MenuItem;
  locale: Locale;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number) => void;
};

export function MenuDetailModal({ menu, locale, onClose, onAddToCart }: Props) {
  const t = useTranslations('menuDetail');
  const [quantity, setQuantity] = useState(1);

  const name = getLocalizedName(menu, locale);
  const spicyLevel = menu.spicy_level ?? 0;

  const handleAdd = () => {
    onAddToCart(menu, quantity);
    onClose();
  };

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
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-h-[85vh] sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 이미지 */}
          <div className="relative aspect-[16/10] w-full shrink-0 bg-gray-100">
            {menu.image_url ? (
              <Image
                src={menu.image_url}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
                unoptimized={menu.image_url.startsWith('http')}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-gray-300">
                🍽️
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
              aria-label={t('close')}
            >
              ×
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto p-4">
            {/* 메뉴 정보 */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">{name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-primary-600 font-semibold">
                  ₩{menu.price.toLocaleString()}
                </span>
                {spicyLevel > 0 && (
                  <span className="text-xs text-amber-600">🌶️ × {spicyLevel}</span>
                )}
              </div>
            </div>

            {/* AI 도슨트 */}
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-700">{t('docentTitle')}</h3>
              <DocentSection menuItemId={menu.id} locale={locale} />
            </div>

            {/* 수량 + 담기 */}
            <div className="mt-auto flex items-center gap-4 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t('quantity')}</span>
                <div className="flex items-center rounded-lg border border-gray-300">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-100"
                    aria-label="-"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-100"
                    aria-label="+"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 rounded-xl bg-primary-500 py-3 font-medium text-white transition hover:bg-primary-600"
              >
                {t('addToCart')} (₩{(menu.price * quantity).toLocaleString()})
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
