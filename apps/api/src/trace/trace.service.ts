import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@context-window/database';
import type { TraceStatus } from '@context-window/shared';
import { createTraceSchema, updateTraceSchema } from '@context-window/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TraceService {
  constructor(private readonly prisma: PrismaService) {}

  private get db(): PrismaClient {
    return this.prisma as unknown as PrismaClient;
  }

  async create(userId: string, body: unknown) {
    const parsed = createTraceSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }
    return this.db.trace.create({
      data: {
        userId,
        title: parsed.data.title,
      },
    });
  }

  async findAllByUserId(userId: string, status?: TraceStatus) {
    return this.db.trace.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { logs: true } } },
    });
  }

  async findOne(id: string, userId: string) {
    const trace = await this.db.trace.findFirst({
      where: { id, userId },
      include: {
        logs: { orderBy: { createdAt: 'asc' } },
        article: true,
      },
    });
    if (!trace) throw new NotFoundException('Trace not found');
    return trace;
  }

  async update(id: string, userId: string, body: unknown) {
    const parsed = updateTraceSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }
    await this.findOne(id, userId);
    return this.db.trace.update({
      where: { id },
      data: parsed.data,
    });
  }
}
