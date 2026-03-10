'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Locale } from '@/types';
import type { MenuItem, Restaurant, RestaurantTable } from '@/types';
import { LanguageSelector } from './LanguageSelector';
import { OrderMenuCard } from './OrderMenuCard';
import { CartBar } from './CartBar';
import { CartModal } from './CartModal';
import { MenuDetailModal } from './MenuDetailModal';

const CATEGORY_ALL = 'all';
const CATEGORY_KEYS: Record<string, string> = {
  all: 'categoryAll',
  main: 'categoryMain',
  side: 'categorySide',
  drink: 'categoryDrink',
};

export type CartEntry = { menuItem: MenuItem; quantity: number };

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
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORY_ALL);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

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

  const getBadgeLabels = useCallback(
    (item: MenuItem, index: number) => {
      const labels: string[] = [];
      if (index === 0) labels.push(t('badgePopular1'));
      else if (index === 1) labels.push(t('badgePopular2'));
      else if (index === 2) labels.push(t('badgePopular3'));
      if (index < 5) labels.push(t('badgeRecommended'));
      return labels;
    },
    [t]
  );

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

  const updateCartQuantity = useCallback((item: MenuItem, delta: number) => {
    setCart((prev) => {
      const i = prev.findIndex((e) => e.menuItem.id === item.id);
      if (i < 0) return prev;
      const next = [...prev];
      const newQty = next[i].quantity + delta;
      if (newQty <= 0) {
        next.splice(i, 1);
        return next;
      }
      next[i] = { ...next[i], quantity: newQty };
      return next;
    });
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (cart.length === 0) return;
    setOrderSubmitting(true);
    setOrderError(null);
    const total = cart.reduce((sum, e) => sum + e.menuItem.price * e.quantity, 0);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tableId,
          items: cart.map((e) => ({
            menuItemId: e.menuItem.id,
            quantity: e.quantity,
            unitPrice: e.menuItem.price,
          })),
          totalPrice: total,
          language: locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Order failed');
      const orderId = (data as { orderId: string }).orderId;
      setCart([]);
      setCartModalOpen(false);
      const pathPrefix = locale === 'ko' ? '' : `/${locale}`;
      router.push(`${pathPrefix}/order/${restaurantId}/${tableId}/checkout/${orderId}`);
    } catch (err) {
      console.error(err);
      setOrderError(err instanceof Error ? err.message : '주문에 실패했습니다. 다시 시도해 주세요.');
      setOrderSubmitting(false);
    }
  }, [cart, restaurantId, tableId, locale, router]);

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
    <div className="min-h-screen bg-white pb-24">
      {/* 헤더: 가게명 + 검색 + 장바구니 (배민 스타일) */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h1 className="truncate text-lg font-bold text-gray-900">
              {restaurant.name}
            </h1>
            <span className="shrink-0 text-sm text-gray-400">{t('tableLabel')} {tableDisplay}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
              aria-label="홈"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
            <LanguageSelector />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
              aria-label={t('searchAria')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setCartModalOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
              aria-label={t('cartAria')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 카테고리 탭: 상단 고정, 가로 스크롤, pill */}
      <div className="sticky top-[52px] z-[9] border-b border-gray-100 bg-white">
        <div className="flex gap-2 overflow-x-auto px-4 py-3">
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
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 섹션 헤더 + 메뉴 리스트 */}
      <main className="px-4">
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
            <motion.section
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <h2 className="border-b border-gray-100 pt-4 pb-2 text-base font-semibold text-gray-900">
                {t('sectionPopular')}
              </h2>
              <ul className="divide-y-0">
                {filteredItems.map((item, index) => (
                  <li key={item.id}>
                    <OrderMenuCard
                      item={item}
                      locale={locale}
                      badgeLabels={getBadgeLabels(item, index)}
                      onAdd={() => addToCart(item)}
                      onOpenDetail={() => setSelectedMenu(item)}
                    />
                  </li>
                ))}
              </ul>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

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

      <AnimatePresence>
        {cartModalOpen && (
          <CartModal
            cart={cart}
            locale={locale}
            onClose={() => setCartModalOpen(false)}
            onUpdateQuantity={updateCartQuantity}
            onPlaceOrder={handlePlaceOrder}
            isSubmitting={orderSubmitting}
            orderError={orderError}
          />
        )}
      </AnimatePresence>

      <CartBar
        itemCount={cartItemCount}
        totalPrice={totalPrice}
        restaurantId={restaurantId}
        tableId={tableId}
        onClick={() => setCartModalOpen(true)}
      />
    </div>
  );
}
