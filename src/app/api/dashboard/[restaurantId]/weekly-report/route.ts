import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, getOwnedRestaurantIds } from '@/lib/auth/server';
import { generateWeeklyReport, type WeeklyReportAggregate } from '@/lib/openai/client';

type Params = { params: Promise<{ restaurantId: string }> };

/** 이번 주 월요일 0:00 UTC → YYYY-MM-DD */
function getThisWeekMondayUTC(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/** 7일 전 0:00 UTC */
function getSevenDaysAgoUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
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
    const weekStart = getThisWeekMondayUTC();

    const { data: cached } = await supabase
      .from('weekly_reports')
      .select('report_json')
      .eq('restaurant_id', restaurantId)
      .eq('week_start', weekStart)
      .maybeSingle();

    if (cached?.report_json) {
      return NextResponse.json(cached.report_json as object);
    }

    const fromDate = getSevenDaysAgoUTC();

    const [ordersResult, reviewsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('id, total_amount')
        .eq('restaurant_id', restaurantId)
        .eq('payment_status', 'paid')
        .gte('created_at', fromDate),
      supabase
        .from('private_reviews')
        .select('rating, food_rating, service_rating, comment')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', fromDate),
    ]);

    const { data: orders } = ordersResult;
    const orderIds = (orders ?? []).map((o) => o.id);
    const totalRevenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);
    const orderCount = orders?.length ?? 0;

    let topMenus: { name: string; quantity: number }[] = [];
    if (orderIds.length > 0) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('menu_item_id, quantity')
        .in('order_id', orderIds);
      const qtyByMenu: Record<string, number> = {};
      for (const oi of orderItems ?? []) {
        qtyByMenu[oi.menu_item_id] = (qtyByMenu[oi.menu_item_id] ?? 0) + oi.quantity;
      }
      const menuIds = Object.keys(qtyByMenu);
      if (menuIds.length > 0) {
        const { data: menus } = await supabase
          .from('menu_items')
          .select('id, name')
          .in('id', menuIds);
        const nameMap = new Map((menus ?? []).map((m) => [m.id, m.name]));
        topMenus = Object.entries(qtyByMenu)
          .map(([id, quantity]) => ({ name: nameMap.get(id) ?? id.slice(0, 8), quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
      }
    }

    const { data: reviews } = reviewsResult;

    let avgRating: number | null = null;
    const lowRatedComments: string[] = [];
    if (reviews?.length) {
      let sum = 0;
      let count = 0;
      for (const r of reviews) {
        const score =
          r.food_rating != null && r.service_rating != null
            ? (r.food_rating + r.service_rating) / 2
            : Number(r.rating);
        if (Number.isFinite(score)) {
          sum += score;
          count++;
        }
        const low = (r.food_rating != null && r.food_rating <= 3) ||
          (r.service_rating != null && r.service_rating <= 3) ||
          (Number(r.rating) <= 3);
        if (low && r.comment?.trim()) lowRatedComments.push(r.comment.trim());
      }
      if (count > 0) avgRating = sum / count;
    }

    const aggregate: WeeklyReportAggregate = {
      totalRevenue,
      orderCount,
      topMenus,
      avgRating,
      lowRatedComments,
    };

    const report = await generateWeeklyReport(aggregate);

    await supabase.from('weekly_reports').upsert(
      {
        restaurant_id: restaurantId,
        week_start: weekStart,
        report_json: report as unknown as Record<string, unknown>,
      },
      { onConflict: 'restaurant_id,week_start' }
    );

    return NextResponse.json(report);
  } catch (err) {
    console.error('[dashboard/weekly-report]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Report generation failed' },
      { status: 500 }
    );
  }
}
