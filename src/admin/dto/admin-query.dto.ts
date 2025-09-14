// Admin Query DTOs - Admin endpoints ke liye query parameters
// Pagination aur filtering ke liye

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * Pagination DTO - Admin lists ke liye pagination
 */
export class AdminPaginationDto {
  @ApiPropertyOptional({
    description: 'Page number - Kaun sa page chahiye',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page number integer hona chahiye' })
  @Min(1, { message: 'Page number 1 se kam nahi ho sakta' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page - Har page mein kitne items',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit integer hona chahiye' })
  @Min(1, { message: 'Limit 1 se kam nahi ho sakta' })
  @Max(100, { message: 'Limit 100 se zyada nahi ho sakta' })
  limit?: number = 10;
}

/**
 * Activity Query DTO - Recent activity ke liye
 */
export class ActivityQueryDto {
  @ApiPropertyOptional({
    description: 'Number of recent items - Kitne recent items chahiye',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit integer hona chahiye' })
  @Min(1, { message: 'Limit 1 se kam nahi ho sakta' })
  @Max(50, { message: 'Limit 50 se zyada nahi ho sakta' })
  limit?: number = 10;
}