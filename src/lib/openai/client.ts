import OpenAI from 'openai';
import type { DocentContent } from '@/types';

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey: key });
}

const LOCALE_NAMES: Record<string, string> = {
  ko: 'Korean',
  en: 'English',
  zh: 'Chinese',
  ja: 'Japanese',
};

/**
 * AI 도슨트: 메뉴 설명/문화적 배경 생성 (구 구조, 호환용)
 */
export async function generateDocentContent(
  menuName: string,
  description: string | null,
  locale: string
): Promise<string> {
  const openai = getClient();
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a friendly Korean food culture docent. Explain the dish in ${locale}, including origin, ingredients, and tips. Keep it concise (2-4 sentences).`,
      },
      {
        role: 'user',
        content: `Menu: ${menuName}. ${description ? `Description: ${description}` : ''} Write a short docent explanation.`,
      },
    ],
    max_tokens: 300,
  });
  return res.choices[0]?.message?.content?.trim() ?? '';
}

/**
 * AI 도슨트: JSON 형식 (cultural_context, ingredients[], recommendation)
 */
export async function generateDocentJSON(
  menuName: string,
  description: string | null,
  locale: string
): Promise<DocentContent> {
  const openai = getClient();
  const lang = LOCALE_NAMES[locale] ?? 'English';
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' as const },
    messages: [
      {
        role: 'system',
        content: `You are a Korean food culture docent. Respond only with valid JSON in ${lang}, no markdown. Keys: "cultural_context" (string, 2-3 sentences about history/culture), "ingredients" (array of main ingredient strings), "recommendation" (string, 1-2 sentences on when/how to enjoy).`,
      },
      {
        role: 'user',
        content: `Menu: ${menuName}. ${description ? `Description: ${description}` : ''} Generate the docent JSON.`,
      },
    ],
    max_tokens: 500,
  });
  const raw = res.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty OpenAI response');
  const parsed = JSON.parse(raw) as DocentContent;
  if (!parsed.cultural_context || !Array.isArray(parsed.ingredients) || !parsed.recommendation) {
    throw new Error('Invalid docent JSON structure');
  }
  return parsed;
}
