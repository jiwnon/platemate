import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ orderId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, restaurant_id, table_id, status, total_amount, payment_status, created_at')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('id, menu_item_id, quantity, unit_price')
      .eq('order_id', orderId);

    if (orderItems?.length) {
      const menuIds = [...new Set(orderItems.map((i) => i.menu_item_id))];
      const { data: menus } = await supabase
        .from('menu_items')
        .select('id, name, name_i18n')
        .in('id', menuIds);
      const menuMap = new Map((menus ?? []).map((m) => [m.id, m]));
      const items = orderItems.map((oi) => ({
        id: oi.id,
        menu_item_id: oi.menu_item_id,
        quantity: oi.quantity,
        unit_price: oi.unit_price,
        menu_name: menuMap.get(oi.menu_item_id)?.name ?? null,
        menu_name_i18n: menuMap.get(oi.menu_item_id)?.name_i18n ?? null,
      }));
      return NextResponse.json({ ...order, items });
    }

    return NextResponse.json({ ...order, items: [] });
  } catch (err) {
    console.error('[orders/[orderId]]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const;

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const body = (await request.json()) as { status?: string };
    const status = body.status;
    if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: 'status required (pending|confirmed|preparing|ready|completed|cancelled)' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('id, status')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found or update failed' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[orders/[orderId] PATCH]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
