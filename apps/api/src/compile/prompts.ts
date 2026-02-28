import type { LogType } from '@context-window/shared'

/** Log-like shape accepted by buildUserMessage (Prisma returns Date, shared Log uses string). */
type LogEntry = {
  type: LogType;
  content: string;
  language: string | null;
  createdAt: Date | string;
};

/**
 * Generates the dynamic system prompt for the LLM Compilation step.
 * @param traceTitle - The title of the Trace (e.g., "Implementing Realtime Dashboard")
 * @param tone - The user-selected output format (e.g., "Technical Tutorial", "Casual Post-mortem")
 */
export function buildSystemPrompt(traceTitle: string, tone: string): string {
  return `You are a Senior Software Engineer acting as a technical ghostwriter. You will be given a chronological list of logs (breadcrumbs) from a developer's work session.

TASK CONTEXT:
- Topic/Title: "${traceTitle}"
- Requested Output Format/Tone: "${tone}"

Your task is to turn this raw, chronological log into a single, well-structured Markdown technical article that reads as if the developer wrote it themselves.

RULES:
1. Preserve Technical Accuracy: Do not invent details, libraries, logic, or solutions that are not explicitly present in the breadcrumbs.
2. Code Integrity: You MUST include the code blocks and error logs provided in the breadcrumbs. Do not alter the core logic of the provided code. Use appropriate markdown language tags.
3. Narrative Flow: Weave the chronological logs into a logical narrative. Show the progression of the work (e.g., The Goal -> The Problem/Error -> The Iteration -> The Solution).
4. Tone Adherence: Strictly adapt your writing style to match the "Requested Output Format/Tone" provided above.
5. Formatting: Use clear Markdown headings (##, ###) to structure the article.
6. Strict Output: Output ONLY the article body in Markdown. Do NOT include an abstract, meta-commentary about the logs, a preamble, or a "Here is the article" wrapper.`;
}

export function buildUserMessage(logs: LogEntry[]): string {
  const lines = logs.map((log, i) => {
    const meta = [log.type, log.language].filter(Boolean).join(' ');
    const header = meta ? `[${meta}]` : `[${log.type}]`;
    const createdAt =
      log.createdAt instanceof Date ? log.createdAt.toISOString() : new Date(log.createdAt).toISOString();
    return `--- Entry ${i + 1} (${createdAt}) ${header} ---\n${log.content}`;
  });
  return `Breadcrumbs (chronological):\n\n${lines.join('\n\n')}`;
}
