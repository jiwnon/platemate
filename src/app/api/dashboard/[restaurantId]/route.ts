import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, getOwnedRestaurantIds } from '@/lib/auth/server';

type Params = { params: Promise<{ restaurantId: string }> };

function getTodayStartUTC(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const owned = await getOwnedRestaurantIds();
    if (!owned.includes(restaurantId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const todayStart = getTodayStartUTC();

    const [pendingResult, todayResult] = await Promise.all([
      supabase
        .from('orders')
        .select('id, table_id, status, total_amount, created_at')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
      supabase
        .from('orders')
        .select('id, total_amount, payment_status')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', todayStart)
        .neq('status', 'cancelled'),
    ]);

    const { data: pendingOrders, error: pendingError } = pendingResult;
    if (pendingError) {
      console.error('[dashboard] pending', pendingError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    const { data: todayOrders } = todayResult;

    const paidToday = (todayOrders ?? []).filter((o) => o.payment_status === 'paid');
    const todayOrderCount = paidToday.length;
    const todayRevenue = paidToday.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const todayAvg = todayOrderCount > 0 ? Math.round(todayRevenue / todayOrderCount) : 0;

    const stats = {
      todayOrderCount,
      todayRevenue,
      todayAvg,
    };

    if (!pendingOrders?.length) {
      return NextResponse.json({ pendingOrders: [], stats });
    }

    const tableIds = [...new Set(pendingOrders.map((o) => o.table_id))];
    const orderIds = pendingOrders.map((o) => o.id);
    const [tablesResult, orderItemsResult] = await Promise.all([
      supabase.from('tables').select('id, name, table_number').in('id', tableIds),
      supabase
        .from('order_items')
        .select('order_id, menu_item_id, quantity, unit_price')
        .in('order_id', orderIds),
    ]);
    const { data: tables } = tablesResult;
    const { data: orderItems } = orderItemsResult;
    const tableMap = new Map((tables ?? []).map((t) => [t.id, t]));

    const menuIds = [...new Set((orderItems ?? []).map((i) => i.menu_item_id))];
    const { data: menus } = await supabase
      .from('menu_items')
      .select('id, name')
      .in('id', menuIds);
    const menuMap = new Map((menus ?? []).map((m) => [m.id, m]));

    const itemsByOrder = new Map<string, { order_id: string; menu_item_id: string; quantity: number; unit_price: number }[]>();
    for (const oi of orderItems ?? []) {
      const list = itemsByOrder.get(oi.order_id) ?? [];
      list.push(oi);
      itemsByOrder.set(oi.order_id, list);
    }

    const pendingWithDetails = pendingOrders.map((o) => {
      const table = tableMap.get(o.table_id);
      const items = (itemsByOrder.get(o.id) ?? []).map((oi) => ({
        menu_name: menuMap.get(oi.menu_item_id)?.name ?? '-',
        quantity: oi.quantity,
        unit_price: oi.unit_price,
      }));
      return {
        id: o.id,
        table_id: o.table_id,
        table_number: table?.table_number ?? null,
        table_name: table?.name ?? '-',
        status: o.status,
        total_amount: o.total_amount,
        created_at: o.created_at,
        items,
      };
    });

    return NextResponse.json({ pendingOrders: pendingWithDetails, stats });
  } catch (err) {
    console.error('[dashboard]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
