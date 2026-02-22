import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { User } from '@context-window/database';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest<Request & { user: User }>();
  return request.user;
});