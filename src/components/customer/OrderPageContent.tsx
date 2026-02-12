'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { Locale } from '@/types';
import type { MenuItem, Restaurant, RestaurantTable } from '@/types';
import { LanguageSelector } from './LanguageSelector';
import { OrderMenuCard } from './OrderMenuCard';
import { CartBar } from './CartBar';
import { MenuDetailModal } from './MenuDetailModal';

const CATEGORY_ALL = 'all';
const CATEGORY_KEYS: Record<string, string> = {
  all: 'categoryAll',
  main: 'categoryMain',
  side: 'categorySide',
  drink: 'categoryDrink',
};

type CartEntry = { menuItem: MenuItem; quantity: number };

type Props = {
  restaurant: Restaurant;
  table: RestaurantTable;
  menuItems: MenuItem[];
  locale: Locale;
  restaurantId: string;
  tableId: string;
};

export function OrderPageContent({
  restaurant,
  table,
  menuItems,
  locale,
  restaurantId,
  tableId,
}: Props) {
  const t = useTranslations('Order');
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORY_ALL);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((item) => {
      const c = (item.category ?? 'main') as string;
      set.add(c.toLowerCase());
    });
    return [CATEGORY_ALL, ...Array.from(set).sort()];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === CATEGORY_ALL) return menuItems;
    return menuItems.filter(
      (item) => (item.category ?? 'main')?.toLowerCase() === selectedCategory
    );
  }, [menuItems, selectedCategory]);

  const addToCart = useCallback((item: MenuItem, quantity = 1) => {
    setCart((prev) => {
      const i = prev.findIndex((e) => e.menuItem.id === item.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + quantity };
        return next;
      }
      return [...prev, { menuItem: item, quantity }];
    });
  }, []);

  const cartItemCount = useMemo(
    () => cart.reduce((sum, e) => sum + e.quantity, 0),
    [cart]
  );
  const totalPrice = useMemo(
    () => cart.reduce((sum, e) => sum + e.menuItem.price * e.quantity, 0),
    [cart]
  );

  const tableDisplay = table.table_number != null
    ? String(table.table_number)
    : table.name;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <LanguageSelector />
          <span className="text-sm font-medium text-gray-500">
            Table {tableDisplay}
          </span>
        </div>
        <h1 className="mt-1 text-lg font-bold text-gray-900">
          {restaurant.name}
        </h1>
      </header>

      {/* 카테고리 탭 */}
      <div className="sticky top-[57px] z-[9] border-b border-gray-100 bg-white px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const label = cat === CATEGORY_ALL ? t('categoryAll') : t(CATEGORY_KEYS[cat] ?? 'categoryMain');
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 메뉴 그리드 */}
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {filteredItems.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center text-gray-500"
            >
              {t('noMenu')}
            </motion.p>
          ) : (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {filteredItems.map((item) => (
                <OrderMenuCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  onAdd={() => addToCart(item)}
                  onOpenDetail={() => setSelectedMenu(item)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 메뉴 상세 모달 */}
      <AnimatePresence>
        {selectedMenu && (
          <MenuDetailModal
            menu={selectedMenu}
            locale={locale}
            onClose={() => setSelectedMenu(null)}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>

      {/* 하단 고정 바 */}
      <CartBar
        itemCount={cartItemCount}
        totalPrice={totalPrice}
        restaurantId={restaurantId}
        tableId={tableId}
        onOrder={() => {
          // TODO: 주문하기 플로우
        }}
      />
    </div>
  );
}
