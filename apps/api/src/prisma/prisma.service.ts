import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@context-window/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await (this as PrismaClient).$connect();
  }

  async onModuleDestroy() {
    await (this as PrismaClient).$disconnect();
  }
}
