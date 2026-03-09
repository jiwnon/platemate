import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, getOwnedRestaurantIds } from '@/lib/auth/server';

type Params = { params: Promise<{ restaurantId: string; menuItemId: string }> };

/** 메뉴 수정 (품절 토글 포함) */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { restaurantId, menuItemId } = await params;
    if (!restaurantId || !menuItemId) {
      return NextResponse.json({ error: 'restaurantId and menuItemId required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const owned = await getOwnedRestaurantIds();
    if (!owned.includes(restaurantId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
      name_i18n?: Record<string, string>;
      description_i18n?: Record<string, string>;
      price?: number;
      image_url?: string | null;
      category?: string | null;
      sort_order?: number;
      is_available?: boolean;
      spicy_level?: number;
    };

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('menu_items')
      .select('id, restaurant_id')
      .eq('id', menuItemId)
      .eq('restaurant_id', restaurantId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.name_i18n !== undefined) updates.name_i18n = body.name_i18n;
    if (body.description_i18n !== undefined) updates.description_i18n = body.description_i18n;
    if (body.price !== undefined) updates.price = body.price;
    if (body.image_url !== undefined) updates.image_url = body.image_url;
    if (body.category !== undefined) updates.category = body.category;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
    if (body.is_available !== undefined) updates.is_available = body.is_available;
    if (body.spicy_level !== undefined) updates.spicy_level = body.spicy_level;

    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', menuItemId)
      .eq('restaurant_id', restaurantId)
      .select()
      .single();

    if (error) {
      console.error('[menu PATCH]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[menu PATCH]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}

/** 메뉴 삭제 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { restaurantId, menuItemId } = await params;
    if (!restaurantId || !menuItemId) {
      return NextResponse.json({ error: 'restaurantId and menuItemId required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const owned = await getOwnedRestaurantIds();
    if (!owned.includes(restaurantId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', menuItemId)
      .eq('restaurant_id', restaurantId);

    if (error) {
      console.error('[menu DELETE]', error);
      if (error.code === '23503') {
        return NextResponse.json(
          { error: '이 메뉴는 주문 내역에 포함되어 삭제할 수 없습니다.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[menu DELETE]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
