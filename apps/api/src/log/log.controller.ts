import type { User } from '@context-window/shared'
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator'
import { SessionGuard } from '../auth/session.guard'
import { LogService } from './log.service'

@Controller('traces/:traceId/logs')
@UseGuards(SessionGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Param('traceId') traceId: string,
    @Body() body: unknown,
  ) {
    return this.logService.create(user.id, {
      ...(typeof body === 'object' && body !== null ? body : {}),
      traceId,
    });
  }

  @Get()
  findAll(@CurrentUser() user: User, @Param('traceId') traceId: string) {
    return this.logService.findAllByTraceId(user.id, traceId);
  }
}

@Controller('logs')
@UseGuards(SessionGuard)
export class LogIdController {
  constructor(private readonly logService: LogService) {}

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.logService.findOne(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: unknown) {
    return this.logService.update(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.logService.remove(user.id, id);
  }
}
