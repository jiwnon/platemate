import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, getOwnedRestaurantIds } from '@/lib/auth/server';

type Params = { params: Promise<{ restaurantId: string }> };

const CATEGORY_ORDER: Record<string, number> = { main: 0, side: 1, drink: 2 };

/** 메뉴 목록 조회 (카테고리·sort_order 기준 정렬) */
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
      .from('menu_items')
      .select('id, restaurant_id, name, description, name_i18n, description_i18n, price, image_url, category, sort_order, is_available, spicy_level, created_at, updated_at')
      .eq('restaurant_id', restaurantId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[menu GET]', error);
      return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
    }

    const items = (data ?? []).slice().sort((a, b) => {
      const catA = CATEGORY_ORDER[a.category ?? 'main'] ?? 99;
      const catB = CATEGORY_ORDER[b.category ?? 'main'] ?? 99;
      if (catA !== catB) return catA - catB;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error('[menu GET]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}

/** 메뉴 추가 */
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

    const body = (await request.json()) as {
      name: string;
      description?: string;
      name_i18n?: Record<string, string>;
      description_i18n?: Record<string, string>;
      price: number;
      image_url?: string | null;
      category?: string | null;
      sort_order?: number;
      is_available?: boolean;
      spicy_level?: number;
    };

    if (!body.name || typeof body.price !== 'number' || body.price < 0) {
      return NextResponse.json({ error: 'name and price (>=0) required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        restaurant_id: restaurantId,
        name: body.name,
        description: body.description ?? null,
        name_i18n: body.name_i18n ?? {},
        description_i18n: body.description_i18n ?? {},
        price: body.price,
        image_url: body.image_url ?? null,
        category: body.category ?? null,
        sort_order: body.sort_order ?? 0,
        is_available: body.is_available ?? true,
        spicy_level: body.spicy_level ?? 0,
        updated_at: new Date().toISOString(),
      })
      .select('id, name, price, category, sort_order, is_available, image_url, created_at')
      .single();

    if (error) {
      console.error('[menu POST]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[menu POST]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
