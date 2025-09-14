// Update Note DTO
// Defines validation rules for note updates

import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsEnum,
  ArrayMaxSize,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';

/**
 * Update Note DTO
 * Validates note update input data (all fields optional)
 */
export class UpdateNoteDto {
  /**
   * Note title
   * Optional field for updates
   */
  @ApiProperty({
    description: 'Note title',
    example: 'Updated Note Title',
    minLength: 1,
    maxLength: 200,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  title?: string;

  /**
   * Note content/description
   * Optional field for updates
   */
  @ApiProperty({
    description: 'Note content/description',
    example: 'Updated note content with new information.',
    minLength: 1,
    maxLength: 10000,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(1, { message: 'Description cannot be empty' })
  @MaxLength(10000, { message: 'Description must not exceed 10,000 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  description?: string;

  /**
   * Note visibility setting
   * Optional field for updates
   */
  @ApiProperty({
    description: 'Note visibility setting',
    enum: Visibility,
    example: Visibility.PUBLIC,
    required: false
  })
  @IsOptional()
  @IsEnum(Visibility, { message: 'Visibility must be PRIVATE, PUBLIC, or SHARED' })
  visibility?: Visibility;

  /**
   * Note tags for categorization
   * Optional array of strings with size limit
   */
  @ApiProperty({
    description: 'Array of tags for note categorization',
    example: ['updated', 'work', 'important'],
    isArray: true,
    required: false,
    maxItems: 10
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @ArrayMaxSize(10, { message: 'Maximum 10 tags allowed' })
  @Transform(({ value }) => 
    Array.isArray(value) 
      ? value.map((tag: string) => tag?.trim().toLowerCase()).filter(Boolean)
      : undefined
  ) // Normalize tags: trim, lowercase, remove empty
  tags?: string[];
}