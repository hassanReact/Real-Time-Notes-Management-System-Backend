// Data Transfer Object for user registration
// Defines validation rules and structure for registration requests

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Register DTO
 * Validates user registration input data
 */
export class RegisterDto {
  /**
   * User's email address
   * Must be a valid email format and will be used for login
   */
  @ApiProperty({
    description: 'User email address for login and communication',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  /**
   * User's password
   * Must be at least 8 characters with complexity requirements
   */
  @ApiProperty({
    description: 'User password with complexity requirements',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  /**
   * User's display name
   * Required field for user identification
   */
  @ApiProperty({
    description: 'User full name for display purposes',
    example: 'John Doe',
    minLength: 2,
    maxLength: 50
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  /**
   * User's phone number (optional)
   * Must be a valid phone number format if provided
   */
  @ApiProperty({
    description: 'User phone number (optional)',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  phone?: string;
}