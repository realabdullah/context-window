/**
 * Default and allowed compile (LLM) providers.
 * Change DEFAULT_COMPILE_PROVIDER here to affect API and web app.
 */
export const COMPILE_PROVIDER_IDS = ['anthropic', 'openai', 'gemini', 'moonshot'] as const;
export type CompileProviderId = (typeof COMPILE_PROVIDER_IDS)[number];

export const DEFAULT_COMPILE_PROVIDER: CompileProviderId = 'gemini';

/**
 * Default tone for compilation when none is provided.
 * Tone is the requested output format (e.g., "Technical Tutorial", "Casual Post-mortem").
 */
export const DEFAULT_COMPILE_TONE = 'Technical Tutorial';

/** Common tone options for the compile UI. */
export const COMPILE_TONE_OPTIONS = [
  'Technical Tutorial',
  'Casual Post-mortem',
  'Internal Runbook',
  'Blog Post',
] as const;

/** Human-readable labels for compile providers. Single source of truth for API and web apps. */
export const COMPILE_PROVIDER_LABELS: Record<CompileProviderId, string> = {
  anthropic: 'Claude (Anthropic)',
  openai: 'GPT-4o (OpenAI)',
  gemini: 'Gemini (Google)',
  moonshot: 'Kimi (Moonshot) 200k',
};
