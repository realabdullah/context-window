/**
 * Allowed frontend origins for CORS and post-login redirect.
 */
const NEXTJS_APP_URL = process.env.NEXTJS_APP_URL ?? 'http://localhost:3000';
const VITE_APP_URL = process.env.VITE_APP_URL ?? 'http://localhost:3002';

const extraOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

export const allowedOrigins: string[] = [
  ...new Set([NEXTJS_APP_URL, VITE_APP_URL, ...extraOrigins].filter((u) => u.length > 0)),
];

export const defaultRedirectOrigin =
  NEXTJS_APP_URL || VITE_APP_URL || extraOrigins[0] || 'http://localhost:3000';

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
