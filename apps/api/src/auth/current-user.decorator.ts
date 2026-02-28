import type { User } from '@context-window/shared'
import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest<Request & { user: User }>();
  return request.user;
});
