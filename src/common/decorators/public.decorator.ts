// Public decorator for marking endpoints as publicly accessible
// Bypasses JWT authentication for specific routes

import { SetMetadata } from '@nestjs/common';

// Metadata key for public routes
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public decorator
 * Marks endpoints as publicly accessible (no authentication required)
 * Usage: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);