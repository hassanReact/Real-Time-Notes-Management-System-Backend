// Roles decorator for role-based access control
// Allows controllers to specify required roles for endpoints

import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

// Metadata key for storing required roles
export const ROLES_KEY = 'roles';

/**
 * Roles decorator
 * Marks endpoints with required roles for access
 * Usage: @Roles(Role.ADMIN, Role.USER)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);