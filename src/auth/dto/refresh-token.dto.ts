// Data Transfer Object for refresh token request
// Validates refresh token for getting new access tokens

import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Refresh Token DTO
 * Validates refresh token for token renewal
 */
export class RefreshTokenDto {
  /**
   * Refresh token
   * Used to generate new access tokens
   */
  @ApiProperty({
    description: 'JWT refresh token for generating new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    minLength: 1
  })
  @IsString({ message: 'Refresh token must be a string' })
  @MinLength(1, { message: 'Refresh token is required' })
  refreshToken: string;
}