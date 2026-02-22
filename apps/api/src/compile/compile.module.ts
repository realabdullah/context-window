import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CompileController } from './compile.controller.js';
import { CompileService } from './compile.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CompileController],
  providers: [CompileService],
  exports: [CompileService],
})
export class CompileModule {}
