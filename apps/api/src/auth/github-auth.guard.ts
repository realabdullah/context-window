import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { getRedirectOriginFromRequest } from './auth-redirect.config';

/**
 * GitHub OAuth guard that passes the client origin as state so we can
 * redirect back to the correct frontend (Next.js or Vite) after login.
 * Origin is taken from the Referer header when the user hits /auth/github.
 */
export class GithubAuthGuard extends AuthGuard('github') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const referer = req.get?.('Referer');
    const state = getRedirectOriginFromRequest(referer);
    return { state };
  }
}
