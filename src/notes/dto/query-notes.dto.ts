import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsArray, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Visibility } from '@prisma/client';

export class QueryNotesDto {
  @ApiPropertyOptional({
    description: 'Page number - Kaun sa page chahiye',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page - Har page mein kitne notes',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search in title and content - Title ya content mein search',
    example: 'meeting notes'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by tags - Tags ke hisab se filter',
    example: ['work', 'important'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Filter by visibility - Kaun dekh sakta hai',
    enum: Visibility,
    example: 'PRIVATE'
  })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @ApiPropertyOptional({
    description: 'Filter by author ID - Kis ne banaya hai',
    example: 'cuid123'
  })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Sort by field - Kis field se sort karna hai',
    example: 'updatedAt',
    default: 'updatedAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'updatedAt';

  @ApiPropertyOptional({
    description: 'Sort order - Ascending ya descending',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}