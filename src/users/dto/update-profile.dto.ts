// Update Profile DTO
// Defines validation rules for user profile updates

import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Update Profile DTO
 * Validates user profile update data
 */
export class UpdateProfileDto {
  /**
   * User's display name
   * Optional field for profile updates
   */
  @ApiProperty({
    description: 'User display name',
    example: 'John Doe Updated',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;

  /**
   * User's phone number
   * Optional field for profile updates
   */
  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  phone?: string;
}