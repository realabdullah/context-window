import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GithubStrategy } from './github.strategy';
import { SessionGuard } from './session.guard';

@Module({
  imports: [PrismaModule, PassportModule.register({ defaultStrategy: 'github' })],
  controllers: [AuthController],
  providers: [AuthService, GithubStrategy, SessionGuard],
  exports: [AuthService, SessionGuard],
})
export class AuthModule {}
