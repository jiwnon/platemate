import OpenAI from 'openai';
import type { DocentContent, WeeklyReportContent } from '@/types';

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
  ru: 'Russian',
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

/**
 * 메뉴 이름·설명을 5개 언어(ko/en/zh/ja/ru)로 자동 번역.
 * 입력 언어는 GPT가 자동 감지하며, 해당 언어는 원문을 그대로 사용.
 */
export async function translateMenuItem(
  name: string,
  description: string | null
): Promise<{ name_i18n: Record<string, string>; description_i18n: Record<string, string> }> {
  const openai = getClient();
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' as const },
    messages: [
      {
        role: 'system',
        content: `You are a professional menu translator for a Korean restaurant app.
Detect the input language automatically and translate both the menu name and description into all 5 languages: Korean (ko), English (en), Chinese Simplified (zh), Japanese (ja), Russian (ru).
For the language that matches the input, preserve the original text as-is.
Respond ONLY with valid JSON in this exact format:
{
  "name": { "ko": "...", "en": "...", "zh": "...", "ja": "...", "ru": "..." },
  "description": { "ko": "...", "en": "...", "zh": "...", "ja": "...", "ru": "..." }
}
If description is empty, return empty strings for all description values.`,
      },
      {
        role: 'user',
        content: `Name: ${name}\nDescription: ${description ?? ''}`,
      },
    ],
    max_tokens: 800,
  });
  const raw = res.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty translation response');
  const parsed = JSON.parse(raw) as {
    name: Record<string, string>;
    description: Record<string, string>;
  };
  return {
    name_i18n: parsed.name,
    description_i18n: parsed.description,
  };
}

/**
 * 메뉴판 이미지에서 메뉴 목록을 추출 (GPT-4o Vision).
 * 파싱 실패 시 빈 배열 반환.
 */
export async function scanMenuFromImage(
  imageBase64: string,
  mimeType: string
): Promise<Array<{ name: string; price: number; description: string; category: string }>> {
  const openai = getClient();
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' as const },
      messages: [
        {
          role: 'system',
          content:
            'You are a menu OCR assistant for a Korean restaurant app.\n' +
            'Extract all menu items from the image.\n' +
            'Respond ONLY with valid JSON: { "items": [{ "name": string, "price": number, "description": string, "category": "main"|"side"|"drink" }] }\n' +
            '- price: number in KRW (Korean Won), 0 if not visible\n' +
            '- category: guess from context (main=밥/면/고기, side=반찬/튀김, drink=음료/주류)\n' +
            '- description: empty string if not visible\n' +
            '- name: use the original Korean text from the image',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            { type: 'text', text: '이 메뉴판에서 메뉴를 추출해 주세요.' },
          ],
        },
      ],
      max_tokens: 2000,
    });
    const raw = res.choices[0]?.message?.content?.trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { items?: unknown };
    if (!Array.isArray(parsed.items)) return [];
    return parsed.items as Array<{ name: string; price: number; description: string; category: string }>;
  } catch {
    return [];
  }
}

export type WeeklyReportAggregate = {
  totalRevenue: number;
  orderCount: number;
  topMenus: { name: string; quantity: number }[];
  avgRating: number | null;
  lowRatedComments: string[];
};

/**
 * 주간 AI 리포트 생성 (GPT-4o, JSON)
 */
export async function generateWeeklyReport(aggregate: WeeklyReportAggregate): Promise<WeeklyReportContent> {
  const openai = getClient();
  const dataText = `
- 지난 7일 총 매출: ${aggregate.totalRevenue.toLocaleString()}원
- 주문 건수: ${aggregate.orderCount}건
- 인기 메뉴(상위 5): ${aggregate.topMenus.map((m) => `${m.name} ${m.quantity}개`).join(', ') || '없음'}
- 평균 평점: ${aggregate.avgRating != null ? aggregate.avgRating.toFixed(1) : '데이터 없음'}
- 저평점(3점 이하) 고객 의견: ${aggregate.lowRatedComments.length ? aggregate.lowRatedComments.join(' | ') : '없음'}
`.trim();

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' as const },
    messages: [
      {
        role: 'system',
        content: `You are a restaurant business analyst. Based on the given weekly data, respond ONLY with valid JSON (no markdown). Keys:
- "sales_summary": string, 2-3 sentences on revenue trend and order count.
- "top_insights": array of strings (2-4 items), key insights (popular/underperforming menus, rating trend).
- "recommendations": array of exactly 3 strings, concrete improvement suggestions.
- "warnings": array of strings (0 or more), issues to watch (e.g. low ratings, complaints).
Use Korean for all text.`,
      },
      {
        role: 'user',
        content: `주간 데이터:\n${dataText}\n\n위 데이터를 분석해 JSON으로 리포트를 생성해 주세요.`,
      },
    ],
    max_tokens: 1000,
  });

  const raw = res.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty OpenAI response');
  const parsed = JSON.parse(raw) as WeeklyReportContent;
  if (
    typeof parsed.sales_summary !== 'string' ||
    !Array.isArray(parsed.top_insights) ||
    !Array.isArray(parsed.recommendations) ||
    !Array.isArray(parsed.warnings)
  ) {
    throw new Error('Invalid weekly report JSON structure');
  }
  return parsed;
}
