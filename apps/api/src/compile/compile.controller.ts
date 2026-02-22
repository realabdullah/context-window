import {
  COMPILE_PROVIDER_IDS,
  DEFAULT_COMPILE_PROVIDER,
  DEFAULT_COMPILE_TONE,
  type CompileProviderId,
} from '@context-window/shared';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { User } from '@context-window/database';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionGuard } from '../auth/session.guard';
import { CompileService } from './compile.service.js';

@Controller('traces')
@UseGuards(SessionGuard)
export class CompileController {
  constructor(private readonly compileService: CompileService) {}

  @Get('compile/providers')
  getProviders() {
    return this.compileService.getProviders();
  }

  @Post(':id/compile')
  async compile(
    @CurrentUser() user: User,
    @Param('id') traceId: string,
    @Body() body: { provider?: string; tone?: string },
  ) {
    const raw = body?.provider ?? DEFAULT_COMPILE_PROVIDER;
    const provider = COMPILE_PROVIDER_IDS.includes(raw as CompileProviderId)
      ? (raw as CompileProviderId)
      : DEFAULT_COMPILE_PROVIDER;
    const tone = body?.tone?.trim() || DEFAULT_COMPILE_TONE;
    return this.compileService.compile(traceId, user.id, provider, tone);
  }
}
