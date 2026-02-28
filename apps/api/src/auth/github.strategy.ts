import type { User } from '@context-window/shared'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github2'
import { AuthService, type GitHubProfile } from './auth.service'

interface GitHubProfileRaw {
  id: string;
  displayName?: string;
  username?: string;
  name?: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      callbackURL: process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:3001/auth/github/callback',
      scope: ['user:email', 'read:user'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GitHubProfileRaw,
  ): Promise<User> {
    const payload: GitHubProfile = {
      id: profile.id,
      displayName: profile.displayName ?? profile.name ?? undefined,
      username: profile.username ?? undefined,
      emails: profile.emails,
      photos: profile.photos,
    };
    return this.authService.findOrCreateUserFromProfile(payload);
  }
}
