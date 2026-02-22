import type { CompileResult, LlmAdapter } from '../llm-adapter.interface.js'

const BASE_URL = 'https://api.moonshot.ai/v1';
const PROVIDER_LABEL = 'Kimi (Moonshot)';

/** Model IDs by context size. Heuristic uses character length of logs payload. */
const MODEL_8K = 'moonshot-v1-8k';
const MODEL_32K = 'moonshot-v1-32k';
const MODEL_128K = 'moonshot-v1-128k';

const CHARS_8K = 8_000;
const CHARS_32K = 32_000;

function selectModel(payloadLength: number): string {
  if (payloadLength < CHARS_8K) return MODEL_8K;
  if (payloadLength < CHARS_32K) return MODEL_32K;
  return MODEL_128K;
}

export class KimiAdapter implements LlmAdapter {
  /** Dynamic per-request; use a stable label for display. */
  get providerId(): string {
    return PROVIDER_LABEL;
  }

  async compile(systemPrompt: string, userMessage: string): Promise<CompileResult> {
    const raw = process.env.MOONSHOT_API_KEY;
    const key = raw?.trim();
    if (!key) {
      throw new Error(
        raw === undefined || raw === ''
          ? 'MOONSHOT_API_KEY is not set (add it to .env at repo root)'
          : 'MOONSHOT_API_KEY is set but empty after trimming (check for whitespace in .env)'
      );
    }

    const payloadLength = userMessage.length;
    const model = selectModel(payloadLength);

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 8192,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      const hint =
        res.status === 401
          ? ' Check MOONSHOT_API_KEY in .env: use a valid key from https://platform.moonshot.cn/console/api-keys (no extra spaces or quotes).'
          : '';
      throw new Error(`Moonshot API error: ${res.status} ${err}.${hint}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? '';
    return { content: text.trim(), providerId: PROVIDER_LABEL };
  }
}
