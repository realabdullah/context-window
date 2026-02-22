import type { LlmAdapter, CompileResult } from '../llm-adapter.interface.js';

const MODEL = 'claude-3-5-sonnet-20241022';
const PROVIDER_ID = 'claude-3.5-sonnet';

export class AnthropicAdapter implements LlmAdapter {
  readonly providerId = PROVIDER_ID;

  async compile(systemPrompt: string, userMessage: string): Promise<CompileResult> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY is not set');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error: ${res.status} ${err}`);
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
    return { content: text.trim(), providerId: PROVIDER_ID };
  }
}
