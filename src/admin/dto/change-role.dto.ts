// Change Role DTO - User ka role change karne ke liye
// Admin USER ko ADMIN bana sakta hai ya vice versa

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

/**
 * Change Role DTO - User ka role change karne ke liye data
 */
export class ChangeRoleDto {
  @ApiProperty({
    description: 'User ka naya role',
    enum: Role,
    example: 'ADMIN',
    enumName: 'Role'
  })
  @IsEnum(Role, { message: 'Role sirf USER ya ADMIN ho sakta hai' })
  role: Role; // USER ya ADMIN
}