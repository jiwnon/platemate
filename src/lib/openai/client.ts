import OpenAI from 'openai';

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey: key });
}

/**
 * AI 도슨트: 메뉴 설명/문화적 배경 생성
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
