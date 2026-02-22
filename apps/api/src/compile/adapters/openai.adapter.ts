import type { LlmAdapter, CompileResult } from '../llm-adapter.interface.js';

const MODEL = 'gpt-4o';
const PROVIDER_ID = 'gpt-4o';

export class OpenAIAdapter implements LlmAdapter {
  readonly providerId = PROVIDER_ID;

  async compile(systemPrompt: string, userMessage: string): Promise<CompileResult> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is not set');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 8192,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${err}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? '';
    return { content: text.trim(), providerId: PROVIDER_ID };
  }
}
