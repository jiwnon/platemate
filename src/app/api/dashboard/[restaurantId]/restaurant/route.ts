import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, getOwnedRestaurantIds } from '@/lib/auth/server';

type Params = { params: Promise<{ restaurantId: string }> };

/** 레스토랑 기본 정보 조회 (수정 폼용) */
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
      .from('restaurants')
      .select('id, name, slug, logo_url, name_i18n, created_at, updated_at')
      .eq('id', restaurantId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[restaurant GET]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}

/** 레스토랑 기본 정보 수정 (이름, 로고 URL, name_i18n) */
export async function PATCH(request: Request, { params }: Params) {
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
      name?: string;
      logo_url?: string | null;
      name_i18n?: Record<string, string>;
    };

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.logo_url !== undefined) updates.logo_url = body.logo_url;
    if (body.name_i18n !== undefined) updates.name_i18n = body.name_i18n;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurantId)
      .select()
      .single();

    if (error) {
      console.error('[restaurant PATCH]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[restaurant PATCH]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
