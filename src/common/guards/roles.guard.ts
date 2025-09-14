// Roles Guard for role-based access control
// Ensures users have required roles to access specific endpoints

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Guard
 * Implements role-based access control by checking user roles against required roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determine if the current user can activate the route
   * Checks if user has any of the required roles
   */
  canActivate(context: ExecutionContext): boolean {
    // Get required roles from route metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get user from request (set by JWT guard)
    const { user } = context.switchToHttp().getRequest();

    // If no user is present, deny access
    if (!user) {
      return false;
    }

    // Check if user has any of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}