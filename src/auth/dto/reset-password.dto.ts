// Data Transfer Object for password reset
// Validates token and new password for reset functionality

import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Reset Password DTO
 * Validates password reset token and new password
 */
export class ResetPasswordDto {
  /**
   * Password reset token
   * Must be provided from email link
   */
  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    minLength: 1
  })
  @IsString({ message: 'Reset token must be a string' })
  @MinLength(1, { message: 'Reset token is required' })
  token: string;

  /**
   * New password
   * Must meet security requirements
   */
  @ApiProperty({
    description: 'New password with complexity requirements',
    example: 'NewSecurePass123!',
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
  newPassword: string;
}