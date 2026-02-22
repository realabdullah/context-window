import {
  COMPILE_PROVIDER_LABELS,
  DEFAULT_COMPILE_TONE,
  type CompileProviderId,
} from '@context-window/shared';
import type { PrismaClient } from '@context-window/database';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnthropicAdapter } from './adapters/anthropic.adapter.js';
import { GeminiAdapter } from './adapters/gemini.adapter.js';
import { KimiAdapter } from './adapters/kimi.adapter.js';
import { OpenAIAdapter } from './adapters/openai.adapter.js';
import type { LlmAdapter } from './llm-adapter.interface.js';
import { buildSystemPrompt, buildUserMessage } from './prompts.js';

@Injectable()
export class CompileService {
  private readonly adapters: Record<CompileProviderId, LlmAdapter>;

  constructor(private readonly prisma: PrismaService) {
    this.adapters = {
      anthropic: new AnthropicAdapter(),
      openai: new OpenAIAdapter(),
      gemini: new GeminiAdapter(),
      moonshot: new KimiAdapter(),
    };
  }

  private get db(): PrismaClient {
    return this.prisma as unknown as PrismaClient;
  }

  async compile(
    traceId: string,
    userId: string,
    provider: CompileProviderId,
    tone: string = DEFAULT_COMPILE_TONE,
  ) {
    const trace = await this.db.trace.findFirst({
      where: { id: traceId, userId },
      include: { logs: { orderBy: { createdAt: 'asc' } }, article: true },
    });
    if (!trace) throw new NotFoundException('Trace not found');
    if (trace.status === 'COMPILED' && trace.article) {
      return { trace, article: trace.article };
    }
    if (!trace.logs.length) {
      throw new BadRequestException('Trace has no logs to compile');
    }

    const adapter = this.adapters[provider];
    const systemPrompt = buildSystemPrompt(trace.title, tone);
    const userMessage = buildUserMessage(trace.logs);

    const { content, providerId } = await adapter.compile(systemPrompt, userMessage);

    const [updatedTrace] = await this.db.$transaction([
      this.db.trace.update({
        where: { id: traceId },
        data: { status: 'COMPILED' },
      }),
      this.db.article.upsert({
        where: { traceId },
        create: {
          traceId,
          content,
          aiProviderUsed: providerId,
          toneUsed: tone,
        },
        update: {
          content,
          aiProviderUsed: providerId,
          toneUsed: tone,
        },
      }),
    ]);

    const article = await this.db.article.findUnique({
      where: { traceId },
    });

    return {
      trace: { ...updatedTrace, logs: trace.logs, article },
      article,
    };
  }

  getProviders(): { id: CompileProviderId; label: string }[] {
    return (Object.keys(COMPILE_PROVIDER_LABELS) as CompileProviderId[]).map((id) => ({
      id,
      label: COMPILE_PROVIDER_LABELS[id],
    }));
  }
}
