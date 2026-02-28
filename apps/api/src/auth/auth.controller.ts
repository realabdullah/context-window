import type { User } from '@context-window/shared'
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common'
import type { Request, Response } from 'express'
import {
  defaultRedirectOrigin,
  isAllowedOrigin,
} from './auth-redirect.config'
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from './auth.constants'
import { AuthService } from './auth.service'
import { CurrentUser } from './current-user.decorator'
import { GithubAuthGuard } from './github-auth.guard'
import { SessionGuard } from './session.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(GithubAuthGuard)
  github() {
    // Passport redirects to GitHub; state = client origin from Referer
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubCallback(@Req() req: Request & { user: User }, @Res() res: Response) {
    const user = req.user;
    const { sessionToken, expiresAt } = await this.authService.createSession(user.id);
    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_MS,
      path: '/',
    });
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const redirectOrigin = isAllowedOrigin(state) ? state : defaultRedirectOrigin;
    res.redirect(`${redirectOrigin}/traces`);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      githubId: user.githubId,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    await this.authService.deleteSession(token);
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.status(204).send();
  }
}
