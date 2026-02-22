import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@context-window/database';
import { createLogSchema, updateLogSchema } from '@context-window/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

  private get db(): PrismaClient {
    return this.prisma as unknown as PrismaClient;
  }

  async create(userId: string, body: unknown) {
    const parsed = createLogSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }
    const { traceId, type, content, language } = parsed.data;
    const trace = await this.db.trace.findFirst({
      where: { id: traceId, userId },
    });
    if (!trace) throw new NotFoundException('Trace not found');
    return this.db.log.create({
      data: { traceId, type, content, language },
    });
  }

  async findAllByTraceId(userId: string, traceId: string) {
    const trace = await this.db.trace.findFirst({
      where: { id: traceId, userId },
    });
    if (!trace) throw new NotFoundException('Trace not found');
    return this.db.log.findMany({
      where: { traceId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const log = await this.db.log.findFirst({
      where: { id },
      include: { trace: true },
    });
    if (!log || log.trace.userId !== userId) throw new NotFoundException('Log not found');
    const { trace: _t, ...logWithoutTrace } = log;
    return logWithoutTrace;
  }

  async update(userId: string, id: string, body: unknown) {
    const parsed = updateLogSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }
    await this.findOne(userId, id);
    return this.db.log.update({
      where: { id },
      data: {
        content: parsed.data.content,
        language: parsed.data.language ?? undefined,
        isEdited: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.db.log.delete({ where: { id } });
  }
}
