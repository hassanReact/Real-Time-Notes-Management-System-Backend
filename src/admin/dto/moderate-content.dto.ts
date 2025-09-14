import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';

export enum ModerationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  DELETE = 'DELETE'
}

export class ModerateContentDto {
  @ApiProperty({
    description: 'Moderation action to take',
    enum: ModerationAction,
    example: 'APPROVE'
  })
  @IsEnum(ModerationAction)
  action: ModerationAction;

  @ApiPropertyOptional({
    description: 'Reason for the moderation action',
    example: 'Content approved after review'
  })
  @IsOptional()
  @IsString()
  reason?: string;
}