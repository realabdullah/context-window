import type { LlmAdapter, CompileResult } from '../llm-adapter.interface.js';

const MODEL = 'gemini-2.0-flash';
const PROVIDER_ID = 'gemini-2.0-flash';

export class GeminiAdapter implements LlmAdapter {
  readonly providerId = PROVIDER_ID;

  async compile(systemPrompt: string, userMessage: string): Promise<CompileResult> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not set');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: {
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${err}`);
    }

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return { content: text.trim(), providerId: PROVIDER_ID };
  }
}
