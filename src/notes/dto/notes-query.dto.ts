// Notes Query DTO
// Defines validation rules for note filtering and pagination

import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';

/**
 * Notes Query DTO
 * Validates query parameters for note listing and filtering
 */
export class NotesQueryDto {
  /**
   * Page number for pagination
   * Default: 1, Min: 1
   */
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  /**
   * Number of items per page
   * Default: 10, Min: 1, Max: 100
   */
  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  /**
   * Search query for title and description
   * Optional text search
   */
  @ApiProperty({
    description: 'Search query for note title and description',
    example: 'important meeting',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  search?: string;

  /**
   * Filter by visibility
   * Optional visibility filter
   */
  @ApiProperty({
    description: 'Filter notes by visibility',
    enum: Visibility,
    example: Visibility.PRIVATE,
    required: false
  })
  @IsOptional()
  @IsEnum(Visibility, { message: 'Visibility must be PRIVATE, PUBLIC, or SHARED' })
  visibility?: Visibility;

  /**
   * Filter by archived status
   * Optional archived filter
   */
  @ApiProperty({
    description: 'Filter notes by archived status',
    example: false,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'Archived must be a boolean value' })
  archived?: boolean;

  /**
   * Filter by tags
   * Optional array of tags to filter by
   */
  @ApiProperty({
    description: 'Filter notes by tags (comma-separated)',
    example: 'work,important',
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
    }
    return value;
  })
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  /**
   * Sort field
   * Field to sort results by
   */
  @ApiProperty({
    description: 'Field to sort results by',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'title'],
    required: false
  })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'title'], {
    message: 'Sort field must be createdAt, updatedAt, or title'
  })
  sortBy?: 'createdAt' | 'updatedAt' | 'title' = 'createdAt';

  /**
   * Sort order
   * Order to sort results (ascending or descending)
   */
  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], {
    message: 'Sort order must be asc or desc'
  })
  sortOrder?: 'asc' | 'desc' = 'desc';
}