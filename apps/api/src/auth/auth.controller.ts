import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import type { User } from '@context-window/database';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { SessionGuard } from './session.guard';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from './auth.constants';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  github() {
    // Passport redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
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
    res.redirect(`${FRONTEND_URL}/traces`);
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
