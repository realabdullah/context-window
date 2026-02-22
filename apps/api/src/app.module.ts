import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CompileModule } from './compile/compile.module';
import { PrismaModule } from './prisma/prisma.module';
import { TraceModule } from './trace/trace.module';
import { LogModule } from './log/log.module';

@Module({
  imports: [PrismaModule, AuthModule, CompileModule, TraceModule, LogModule],
})
export class AppModule {}
