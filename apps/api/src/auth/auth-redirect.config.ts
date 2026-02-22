/**
 * Allowed frontend origins for CORS and post-login redirect.
 * Set these in production so the API allows your deployed app origin
 * (e.g. VITE_APP_URL=https://cwn.abdspace.xyz for the Vite app).
 * Login flow uses ?state=origin or Referer to choose redirect after OAuth.
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
