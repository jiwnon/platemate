import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, getOwnedRestaurantIds } from '@/lib/auth/server';

type Params = { params: Promise<{ orderId: string }> };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET은 결제 완료 후 손님(비로그인)도 본인 주문 확인에 사용됨.
// orderId가 UUID이므로 추측이 사실상 불가능하며, UUID 형식 검증으로 무작위 probing을 방지함.
export async function GET(_request: Request, { params }: Params) {
  try {
    const { orderId } = await params;
    if (!orderId || !UUID_REGEX.test(orderId)) {
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
    if (!orderId || !UUID_REGEX.test(orderId)) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, restaurant_id')
      .eq('id', orderId)
      .single();
    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const owned = await getOwnedRestaurantIds();
    if (!owned.includes(order.restaurant_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
