import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, getOwnedRestaurantIds } from '@/lib/auth/server';

type Params = { params: Promise<{ restaurantId: string }> };

/** 테이블 목록 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const owned = await getOwnedRestaurantIds();
    if (!owned.includes(restaurantId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tables')
      .select('id, restaurant_id, name, table_number, qr_code, created_at, updated_at')
      .eq('restaurant_id', restaurantId)
      .order('table_number', { ascending: true });

    if (error) {
      console.error('[tables GET]', error);
      return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
    }
    return NextResponse.json({ items: data ?? [] });
  } catch (err) {
    console.error('[tables GET]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}

/** 테이블 추가 */
export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const owned = await getOwnedRestaurantIds();
    if (!owned.includes(restaurantId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as { name: string; table_number?: number | null };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tables')
      .insert({
        restaurant_id: restaurantId,
        name: body.name.trim(),
        table_number: body.table_number ?? null,
        updated_at: new Date().toISOString(),
      })
      .select('id, name, table_number, created_at')
      .single();

    if (error) {
      console.error('[tables POST]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[tables POST]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
