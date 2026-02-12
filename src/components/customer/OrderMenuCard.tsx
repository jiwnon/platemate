'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Locale } from '@/types';
import type { MenuItem } from '@/types';
import { getLocalizedName } from '@/lib/utils/menu';

type Props = {
  item: MenuItem;
  locale: Locale;
  onAdd: () => void;
  onOpenDetail?: () => void;
};

export function OrderMenuCard({ item, locale, onAdd, onOpenDetail }: Props) {
  const name = getLocalizedName(item, locale);
  const spicyLevel = item.spicy_level ?? 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      role={onOpenDetail ? 'button' : undefined}
      tabIndex={onOpenDetail ? 0 : undefined}
      onClick={onOpenDetail}
      onKeyDown={onOpenDetail ? (e) => e.key === 'Enter' && onOpenDetail() : undefined}
      className={`flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-primary-200 hover:shadow ${onOpenDetail ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-square w-full bg-gray-100">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
            unoptimized={item.image_url.startsWith('http')}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl text-gray-300">
            🍽️
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onAdd();
          }}
          className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-lg font-bold text-white shadow-md transition hover:bg-primary-600 active:scale-95"
          aria-label="Add to cart"
        >
          +
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-medium text-gray-900 line-clamp-2">{name}</h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-primary-600 font-medium">
            ₩{item.price.toLocaleString()}
          </span>
          {spicyLevel > 0 && (
            <span className="text-xs text-amber-600">
              🌶️ × {spicyLevel}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
