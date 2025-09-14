// Create Note DTO
// Defines validation rules for note creation

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
 * Create Note DTO
 * Validates note creation input data
 */
export class CreateNoteDto {
  /**
   * Note title
   * Required field with length constraints
   */
  @ApiProperty({
    description: 'Note title',
    example: 'My Important Note',
    minLength: 1,
    maxLength: 200
  })
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  title: string;

  /**
   * Note content/description
   * Required field with length constraints
   */
  @ApiProperty({
    description: 'Note content/description',
    example: 'This is the detailed content of my note with important information.',
    minLength: 1,
    maxLength: 10000
  })
  @IsString({ message: 'Description must be a string' })
  @MinLength(1, { message: 'Description is required' })
  @MaxLength(10000, { message: 'Description must not exceed 10,000 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  description: string;

  /**
   * Note visibility setting
   * Optional field with default as PRIVATE
   */
  @ApiProperty({
    description: 'Note visibility setting',
    enum: Visibility,
    example: Visibility.PRIVATE,
    required: false
  })
  @IsOptional()
  @IsEnum(Visibility, { message: 'Visibility must be PRIVATE, PUBLIC, or SHARED' })
  visibility?: Visibility = Visibility.PRIVATE;

  /**
   * Note tags for categorization
   * Optional array of strings with size limit
   */
  @ApiProperty({
    description: 'Array of tags for note categorization',
    example: ['work', 'important', 'project'],
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
      : []
  ) // Normalize tags: trim, lowercase, remove empty
  tags?: string[] = [];
}