// Data Transfer Object for forgot password request
// Validates email for password reset functionality

import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Forgot Password DTO
 * Validates email for password reset request
 */
export class ForgotPasswordDto {
  /**
   * User's email address for password reset
   * Must be a valid email format
   */
  @ApiProperty({
    description: 'Email address to send password reset link',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}