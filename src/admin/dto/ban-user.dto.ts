import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class BanUserDto {
  @ApiProperty({
    description: 'Reason for banning the user',
    example: 'Violation of community guidelines'
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Ban expiry date (ISO string). If not provided, ban is permanent',
    example: '2024-12-31T23:59:59.000Z'
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}