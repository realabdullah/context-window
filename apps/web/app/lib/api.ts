/**
 * API client for the NestJS backend.
 * Session cookie is sent via credentials: 'include'.
 */

export const getBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return (import.meta.env.VITE_API_URL as string).replace(/\/$/, '');
  }
  return 'http://localhost:3001';
};

const defaultFetchOptions: RequestInit = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

function headers(): HeadersInit {
  return { ...defaultFetchOptions.headers } as HeadersInit;
}

export interface AuthUser {
  id: string;
  email: string;
  githubId: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchAuthMe(): Promise<AuthUser | null> {
  const res = await fetch(`${getBaseUrl()}/auth/me`, { ...defaultFetchOptions });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

/** Use for navigation only (e.g. <a href>). Do not fetch this URL — use full page navigation to avoid CORS. */
export function getAuthLoginUrl(): string {
  const base = `${getBaseUrl()}/auth/github`;
  if (typeof window !== 'undefined') {
    const state = encodeURIComponent(window.location.origin);
    return `${base}?state=${state}`;
  }
  return base;
}

export async function fetchLogout(): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/auth/logout`, {
    method: 'POST',
    ...defaultFetchOptions,
  });
  if (!res.ok && res.status !== 204) throw new Error(await res.text().catch(() => res.statusText));
}

export interface Article {
  id: string;
  traceId: string;
  content: string;
  toneUsed: string | null;
  aiProviderUsed: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trace {
  id: string;
  userId: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  logs?: Log[];
  article?: Article | null;
  _count?: { logs: number };
}

export interface Log {
  id: string;
  traceId: string;
  type: 'TEXT' | 'CODE' | 'ERROR' | 'INSIGHT';
  content: string;
  language: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchTraces(status?: string): Promise<Trace[]> {
  const url = new URL(`${getBaseUrl()}/traces`);
  if (status) url.searchParams.set('status', status);
  const res = await fetch(url.toString(), { ...defaultFetchOptions, headers: headers() });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export async function fetchTrace(id: string): Promise<Trace> {
  const res = await fetch(`${getBaseUrl()}/traces/${id}`, { ...defaultFetchOptions, headers: headers() });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export async function createTrace(title: string): Promise<Trace> {
  const res = await fetch(`${getBaseUrl()}/traces`, {
    method: 'POST',
    ...defaultFetchOptions,
    headers: headers(),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export async function createLog(
  traceId: string,
  payload: { type: string; content: string; language?: string }
): Promise<Log> {
  const res = await fetch(`${getBaseUrl()}/traces/${traceId}/logs`, {
    method: 'POST',
    ...defaultFetchOptions,
    headers: headers(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export async function updateLog(
  id: string,
  payload: { content: string; language?: string | null }
): Promise<Log> {
  const res = await fetch(`${getBaseUrl()}/logs/${id}`, {
    method: 'PATCH',
    ...defaultFetchOptions,
    headers: headers(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export interface CompileProviderOption {
  id: string;
  label: string;
}

export async function fetchCompileProviders(): Promise<CompileProviderOption[]> {
  const res = await fetch(`${getBaseUrl()}/traces/compile/providers`, {
    ...defaultFetchOptions,
    headers: headers(),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export async function compileTrace(
  traceId: string,
  provider: string,
  tone?: string
): Promise<{ trace: Trace; article: Article | null }> {
  const res = await fetch(`${getBaseUrl()}/traces/${traceId}/compile`, {
    method: 'POST',
    ...defaultFetchOptions,
    headers: headers(),
    body: JSON.stringify({ provider, ...(tone && { tone }) }),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}
