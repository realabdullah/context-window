import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import {
  getRedirectOriginFromRequest,
  isAllowedOrigin,
} from './auth-redirect.config';

/**
 * GitHub OAuth guard that passes the client origin as state so we can
 * redirect back to the correct frontend (Next.js or Vite) after login.
 * Prefer state from query (?state=origin); fallback to Referer (can be stripped by Referrer-Policy).
 */
export class GithubAuthGuard extends AuthGuard('github') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const queryState =
      typeof req.query?.state === 'string' && req.query.state.length > 0
        ? req.query.state
        : undefined;
    const referer = req.get?.('Referer');
    const state =
      (queryState && isAllowedOrigin(queryState) ? queryState : undefined) ??
      getRedirectOriginFromRequest(referer);
    return { state };
  }
}
