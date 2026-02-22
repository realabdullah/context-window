/**
 * Allowed frontend origins for CORS and post-login redirect.
 * Each app (Next.js, Vite) has its own env key; we detect which client
 * initiated login via Referer and redirect back there.
 */
const NEXTJS_APP_URL = process.env.NEXTJS_APP_URL ?? 'http://localhost:3000';
const VITE_APP_URL = process.env.VITE_APP_URL ?? 'http://localhost:3002';

export const allowedOrigins: string[] = [NEXTJS_APP_URL, VITE_APP_URL].filter(
  (u) => u.length > 0,
);

export const defaultRedirectOrigin =
  NEXTJS_APP_URL || VITE_APP_URL || 'http://localhost:3000';

export function getAllowedOrigins(): string[] {
  return [...allowedOrigins];
}

export function isAllowedOrigin(origin: string): boolean {
  try {
    const o = new URL(origin).origin;
    return allowedOrigins.includes(o);
  } catch {
    return false;
  }
}

/** Resolve redirect origin from request (Referer) or fallback to default. */
export function getRedirectOriginFromRequest(referer: string | undefined): string {
  if (!referer || typeof referer !== 'string') return defaultRedirectOrigin;
  try {
    const origin = new URL(referer).origin;
    return allowedOrigins.includes(origin) ? origin : defaultRedirectOrigin;
  } catch {
    return defaultRedirectOrigin;
  }
}
