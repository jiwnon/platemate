import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type CreateOrderItem = { menuItemId: string; quantity: number; unitPrice: number };

type Body = {
  restaurantId: string;
  tableId: string;
  items: CreateOrderItem[];
  totalPrice: number;
  language?: string;
};

const VALID_LOCALES = ['ko', 'en', 'zh', 'ja'];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const { restaurantId, tableId, items, totalPrice, language } = body;

    if (!restaurantId || !tableId || !Array.isArray(items) || typeof totalPrice !== 'number') {
      return NextResponse.json(
        { error: 'restaurantId, tableId, items, totalPrice required' },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'items cannot be empty' },
        { status: 400 }
      );
    }

    const locale = language && VALID_LOCALES.includes(language) ? language : null;

    const supabase = await createClient();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        table_id: tableId,
        status: 'pending',
        total_amount: totalPrice,
        payment_status: 'pending',
        locale: locale ?? undefined,
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('[orders/create]', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error('[orders/create] order_items', itemsError);
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error('[orders/create]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
