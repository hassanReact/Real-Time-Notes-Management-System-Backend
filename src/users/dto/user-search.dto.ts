// User Search DTO
// Defines validation rules for user search queries

import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * User Search DTO
 * Validates user search parameters
 */
export class UserSearchDto {
  /**
   * Search query string
   * Searches in name and email fields
   */
  @ApiProperty({
    description: 'Search query for user name or email',
    example: 'john',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Query must be a string' })
  @MinLength(2, { message: 'Query must be at least 2 characters long' })
  @MaxLength(50, { message: 'Query must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  query?: string;

  /**
   * Maximum number of results to return
   * Default: 10, Max: 50
   */
  @ApiProperty({
    description: 'Maximum number of results to return',
    example: 10,
    minimum: 1,
    maximum: 50,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) // Convert string to number
  limit?: number = 10;
}