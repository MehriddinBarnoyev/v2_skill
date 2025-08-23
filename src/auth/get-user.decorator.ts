import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express'; // Import Express Request for typing
import { User } from '../users/schemas/user.schema'; // Import your User type

export const GetUser = createParamDecorator< ExecutionContext, User>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user: User }>();
    return request.user;
  },
);