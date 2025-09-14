// Authentication Response DTOs
// Defines response structures for authentication endpoints

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/**
 * User Response DTO
 * Represents user data in API responses (without sensitive fields)
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 'cuid123456789abcdef'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/avatars/user123.jpg',
    required: false
  })
  profilePicture?: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: Role,
    example: Role.USER
  })
  role: Role;

  @ApiProperty({
    description: 'Account active status',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Email verification status',
    example: true
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2023-12-01T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last account update timestamp',
    example: '2023-12-01T10:30:00.000Z'
  })
  updatedAt: Date;
}

/**
 * Authentication Response DTO
 * Represents successful authentication response with tokens
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserResponseDto
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'JWT access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.different_signature_here'
  })
  refreshToken: string;
}

/**
 * Token Refresh Response DTO
 * Represents response from token refresh endpoint
 */
export class TokenRefreshResponseDto {
  @ApiProperty({
    description: 'New JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  })
  accessToken: string;
}

/**
 * Success Message Response DTO
 * Represents simple success responses
 */
export class SuccessMessageResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully'
  })
  message: string;
}