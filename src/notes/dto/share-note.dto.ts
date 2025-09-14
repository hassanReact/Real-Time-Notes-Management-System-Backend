import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class ShareNoteDto {
  @ApiProperty({
    description: 'Array of user IDs to share the note with',
    example: ['uuid1', 'uuid2'],
    type: [String]
  })
  @IsArray()
  @ArrayNotEmpty()
  userIds: string[];
}