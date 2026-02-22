import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LogController, LogIdController } from './log.controller';
import { LogService } from './log.service';

@Module({
  imports: [AuthModule],
  controllers: [LogController, LogIdController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
