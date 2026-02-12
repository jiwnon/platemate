import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrderPageContent } from '@/components/customer/OrderPageContent';
import type { Restaurant, RestaurantTable, MenuItem } from '@/types';
import type { Locale } from '@/types';

type Props = {
  params: Promise<{ locale: string; restaurantId: string; tableId: string }>;
};

const LOCALES: Locale[] = ['ko', 'en', 'zh', 'ja'];

export default async function OrderPage({ params }: Props) {
  const { locale: localeParam, restaurantId, tableId } = await params;
  const locale = LOCALES.includes(localeParam as Locale) ? (localeParam as Locale) : 'ko';

  const supabase = await createClient();

  const [{ data: restaurant, error: restaurantError }, { data: table, error: tableError }] =
    await Promise.all([
      supabase.from('restaurants').select('id, name, slug, logo_url, name_i18n, created_at, updated_at').eq('id', restaurantId).single(),
      supabase.from('tables').select('id, restaurant_id, name, table_number, qr_code, created_at, updated_at').eq('id', tableId).single(),
    ]);

  if (restaurantError || !restaurant) {
    notFound();
  }

  if (tableError || !table) {
    notFound();
  }

  if (table.restaurant_id !== restaurant.id) {
    notFound();
  }

  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('id, restaurant_id, name, description, name_i18n, description_i18n, price, image_url, docent_content, sort_order, is_available, category, spicy_level, created_at, updated_at')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('sort_order', { ascending: true });

  if (menuError) {
    notFound();
  }

  const restaurantTyped: Restaurant = {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    logo_url: restaurant.logo_url ?? undefined,
    name_i18n: (restaurant.name_i18n as Record<Locale, string>) ?? undefined,
    created_at: restaurant.created_at,
    updated_at: restaurant.updated_at,
  };

  const tableTyped: RestaurantTable = {
    id: table.id,
    restaurant_id: table.restaurant_id,
    name: table.name,
    table_number: table.table_number ?? undefined,
    qr_code: table.qr_code ?? undefined,
    created_at: table.created_at,
    updated_at: table.updated_at,
  };

  const menuItemsTyped: MenuItem[] = (menuItems ?? []).map((row) => ({
    id: row.id,
    restaurant_id: row.restaurant_id,
    name: row.name,
    description: row.description ?? undefined,
    name_i18n: (row.name_i18n as Record<Locale, string>) ?? undefined,
    description_i18n: (row.description_i18n as Record<Locale, string>) ?? undefined,
    price: row.price,
    image_url: row.image_url ?? undefined,
    docent_content: row.docent_content ?? undefined,
    sort_order: row.sort_order,
    is_available: row.is_available,
    category: row.category ?? undefined,
    spicy_level: row.spicy_level ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return (
    <OrderPageContent
      restaurant={restaurantTyped}
      table={tableTyped}
      menuItems={menuItemsTyped}
      locale={locale}
      restaurantId={restaurantId}
      tableId={tableId}
    />
  );
}
