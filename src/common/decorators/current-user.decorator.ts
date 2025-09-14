// Custom decorator for extracting current user from request
// Simplifies access to authenticated user data in controllers

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * Current User decorator
 * Extracts the authenticated user from the request object
 * Usage: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | any => {
    // Get the request object from execution context
    const request = ctx.switchToHttp().getRequest();
    
    // Extract user from request (set by JWT strategy)
    const user = request.user;
    
    // If specific property requested, return that property
    if (data) {
      return user?.[data];
    }
    
    // Return the entire user object
    return user;
  },
);