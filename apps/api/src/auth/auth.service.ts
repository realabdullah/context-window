import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { PrismaClient } from '@context-window/database';
import { PrismaService } from '../prisma/prisma.service';
import { SESSION_MAX_AGE_MS } from './auth.constants';

export type GitHubProfile = {
  id: string;
  displayName?: string;
  username?: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private get db(): PrismaClient {
    return this.prisma as unknown as PrismaClient;
  }

  async findOrCreateUserFromProfile(profile: GitHubProfile) {
    const githubId = profile.id;
    const email = profile.emails?.[0]?.value ?? `${githubId}@users.noreply.github.com`;
    const name = profile.displayName ?? profile.username ?? null;
    const avatarUrl = profile.photos?.[0]?.value ?? null;

    const existing = await this.db.user.findUnique({ where: { githubId } });
    if (existing) {
      await this.db.user.update({
        where: { id: existing.id },
        data: { name, avatarUrl, updatedAt: new Date() },
      });
      return this.db.user.findUniqueOrThrow({ where: { id: existing.id } });
    }

    const byEmail = await this.db.user.findUnique({ where: { email } });
    if (byEmail) {
      await this.db.user.update({
        where: { id: byEmail.id },
        data: { githubId, name, avatarUrl, updatedAt: new Date() },
      });
      return this.db.user.findUniqueOrThrow({ where: { id: byEmail.id } });
    }

    return this.db.user.create({
      data: { email, githubId, name, avatarUrl },
    });
  }

  async createSession(userId: string): Promise<{ sessionToken: string; expiresAt: Date }> {
    const sessionToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
    await this.db.session.create({
      data: { userId, sessionToken, expiresAt },
    });
    return { sessionToken, expiresAt };
  }

  async findByToken(sessionToken: string | undefined) {
    if (!sessionToken?.trim()) return null;
    const session = await this.db.session.findUnique({
      where: { sessionToken: sessionToken.trim() },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      if (session) await this.db.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }
    return session.user;
  }

  async deleteSession(sessionToken: string | undefined): Promise<void> {
    if (!sessionToken?.trim()) return;
    await this.db.session.deleteMany({ where: { sessionToken: sessionToken.trim() } });
  }
}
