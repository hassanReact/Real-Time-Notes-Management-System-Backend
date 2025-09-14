import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID of the user who will receive the notification',
    example: 'uuid'
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: 'NOTE_SHARED'
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Note Shared'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'John Doe shared a note "My Important Note" with you'
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Additional data for the notification',
    example: { noteId: 'uuid', sharedByUserId: 'uuid' },
    required: false
  })
  @IsOptional()
  @IsObject()
  data?: any;
}