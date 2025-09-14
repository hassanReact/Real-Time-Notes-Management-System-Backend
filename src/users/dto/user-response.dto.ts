// User Response DTOs
// Defines response structures for user-related endpoints

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/**
 * Public User Response DTO
 * User data for public display (search results, sharing)
 */
export class PublicUserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 'cuid123456789abcdef'
  })
  id: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/avatars/user123.jpg',
    required: false
  })
  profilePicture?: string;
}

/**
 * Full User Profile Response DTO
 * Complete user profile data for authenticated user
 */
export class UserProfileResponseDto extends PublicUserResponseDto {
  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false
  })
  phone?: string;

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
 * User Search Results Response DTO
 * Response structure for user search endpoint
 */
export class UserSearchResponseDto {
  @ApiProperty({
    description: 'Array of matching users',
    type: [PublicUserResponseDto]
  })
  users: PublicUserResponseDto[];

  @ApiProperty({
    description: 'Total number of matching users',
    example: 25
  })
  total: number;

  @ApiProperty({
    description: 'Number of results returned',
    example: 10
  })
  count: number;
}