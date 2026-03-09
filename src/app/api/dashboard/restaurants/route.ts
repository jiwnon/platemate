import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** 신규 레스토랑 생성 + restaurant_owners에 현재 사용자 자동 등록 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      name: string;
      slug: string;
      logo_url?: string | null;
      name_i18n?: Record<string, string>;
    };

    const name = body.name?.trim();
    const slug = body.slug?.trim().toLowerCase().replace(/\s+/g, '-');
    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug required' }, { status: 400 });
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'slug must be lowercase letters, numbers, hyphens only' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: restaurant, error: insertError } = await supabase
      .from('restaurants')
      .insert({
        name,
        slug,
        logo_url: body.logo_url ?? null,
        name_i18n: body.name_i18n ?? {},
        updated_at: new Date().toISOString(),
      })
      .select('id, name, slug, created_at')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: '이미 사용 중인 슬러그입니다.' }, { status: 409 });
      }
      console.error('[restaurants POST]', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { error: ownerError } = await supabase.from('restaurant_owners').insert({
      user_id: user.id,
      restaurant_id: restaurant.id,
    });

    if (ownerError) {
      console.error('[restaurant_owners insert]', ownerError);
      return NextResponse.json(
        { error: 'Restaurant created but owner link failed' },
        { status: 500 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (err) {
    console.error('[restaurants POST]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
