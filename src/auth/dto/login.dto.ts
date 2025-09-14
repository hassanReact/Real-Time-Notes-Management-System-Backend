// Data Transfer Object for user login
// Defines validation rules for login requests

import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Login DTO
 * Validates user login credentials
 */
export class LoginDto {
  /**
   * User's email address
   * Must be a valid email format
   */
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  /**
   * User's password
   * Must meet minimum length requirement
   */
  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
    minLength: 1
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(1, { message: 'Password is required' })
  password: string;
}