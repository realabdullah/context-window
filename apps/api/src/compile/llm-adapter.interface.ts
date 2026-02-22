/**
 * Adapter interface for LLM providers.
 * All API keys are read from env in implementations; never exposed to client.
 */
export interface CompileResult {
  content: string;
  providerId: string; // e.g. 'claude-3-5-sonnet-20241022', 'gemini-2.5-flash'
}

export interface LlmAdapter {
  readonly providerId: string;
  compile(systemPrompt: string, userMessage: string): Promise<CompileResult>;
}
