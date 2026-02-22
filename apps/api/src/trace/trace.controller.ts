import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type { TraceStatus } from '@context-window/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionGuard } from '../auth/session.guard';
import type { User } from '@context-window/database';
import { TraceService } from './trace.service';

@Controller('traces')
@UseGuards(SessionGuard)
export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() body: unknown) {
    return this.traceService.create(user.id, body);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query('status') status?: TraceStatus) {
    return this.traceService.findAllByUserId(user.id, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.traceService.findOne(id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() body: unknown) {
    return this.traceService.update(id, user.id, body);
  }
}
