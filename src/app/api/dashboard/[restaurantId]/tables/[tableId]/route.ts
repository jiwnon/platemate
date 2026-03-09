import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, getOwnedRestaurantIds } from '@/lib/auth/server';

type Params = { params: Promise<{ restaurantId: string; tableId: string }> };

/** 테이블 수정 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { restaurantId, tableId } = await params;
    if (!restaurantId || !tableId) {
      return NextResponse.json({ error: 'restaurantId and tableId required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const owned = await getOwnedRestaurantIds();
    if (!owned.includes(restaurantId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as { name?: string; table_number?: number | null };
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('tables')
      .select('id')
      .eq('id', tableId)
      .eq('restaurant_id', restaurantId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.table_number !== undefined) updates.table_number = body.table_number;

    const { data, error } = await supabase
      .from('tables')
      .update(updates)
      .eq('id', tableId)
      .eq('restaurant_id', restaurantId)
      .select()
      .single();

    if (error) {
      console.error('[tables PATCH]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[tables PATCH]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}

/** 테이블 삭제 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { restaurantId, tableId } = await params;
    if (!restaurantId || !tableId) {
      return NextResponse.json({ error: 'restaurantId and tableId required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const owned = await getOwnedRestaurantIds();
    if (!owned.includes(restaurantId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', tableId)
      .eq('restaurant_id', restaurantId);

    if (error) {
      console.error('[tables DELETE]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[tables DELETE]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
