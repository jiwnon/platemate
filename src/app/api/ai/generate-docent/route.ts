import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDocentJSON } from '@/lib/openai/client';
import type { DocentContent } from '@/types';
import type { Locale } from '@/types';

const VALID_LOCALES: Locale[] = ['ko', 'en', 'zh', 'ja'];
const DOCENT_COLUMNS: Record<Locale, 'ai_docent_ko' | 'ai_docent_en' | 'ai_docent_zh' | 'ai_docent_ja'> = {
  ko: 'ai_docent_ko',
  en: 'ai_docent_en',
  zh: 'ai_docent_zh',
  ja: 'ai_docent_ja',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { menuItemId, locale: localeParam } = body as { menuItemId?: string; locale?: string };

    if (!menuItemId || typeof menuItemId !== 'string') {
      return NextResponse.json(
        { error: 'menuItemId is required' },
        { status: 400 }
      );
    }

    const locale = VALID_LOCALES.includes(localeParam as Locale) ? (localeParam as Locale) : 'en';
    const column = DOCENT_COLUMNS[locale];

    const supabase = await createClient();

    const { data: menuItem, error: fetchError } = await supabase
      .from('menu_items')
      .select('id, name, description, name_i18n, ai_docent_ko, ai_docent_en, ai_docent_zh, ai_docent_ja')
      .eq('id', menuItemId)
      .single();

    if (fetchError || !menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    const cached = menuItem[column] as string | null | undefined;
    if (cached && cached.trim()) {
      try {
        const parsed = JSON.parse(cached) as DocentContent;
        return NextResponse.json(parsed);
      } catch {
        // invalid JSON, regenerate below
      }
    }

    const menuName = (menuItem.name_i18n as Record<string, string>)?.[locale] ?? menuItem.name;
    const description = menuItem.description ?? null;

    const docent = await generateDocentJSON(menuName, description, locale);
    const jsonString = JSON.stringify(docent);

    await supabase
      .from('menu_items')
      .update({ [column]: jsonString })
      .eq('id', menuItemId);

    return NextResponse.json(docent);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[generate-docent]', err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
