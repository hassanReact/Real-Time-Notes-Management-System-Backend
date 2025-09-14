import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { ShareNoteDto } from './dto/share-note.dto';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { AnalyticsService } from '../analytics/analytics.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    schema: {
      example: {
        id: 'uuid',
        title: 'My Note',
        content: 'Note content',
        tags: ['work', 'important'],
        visibility: 'PRIVATE',
        authorId: 'uuid',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        author: {
          id: 'uuid',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe'
        },
        versions: [],
        sharedWith: []
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createNoteDto: CreateNoteDto, @Request() req: RequestWithUser) {
    return this.notesService.create(createNoteDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in title and content' })
  @ApiQuery({ name: 'tags', required: false, type: [String], description: 'Filter by tags' })
  @ApiQuery({ name: 'visibility', required: false, enum: ['PRIVATE', 'SHARED', 'PUBLIC'], description: 'Filter by visibility' })
  @ApiQuery({ name: 'authorId', required: false, type: String, description: 'Filter by author' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Notes retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            title: 'My Note',
            content: 'Note content',
            tags: ['work'],
            visibility: 'PRIVATE',
            authorId: 'uuid',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
            author: {
              id: 'uuid',
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe'
            },
            sharedWith: [],
            _count: { versions: 1 }
          }
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QueryNotesDto, @Request() req: RequestWithUser) {
    return this.notesService.findAll(queryDto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({
    status: 200,
    description: 'Note retrieved successfully',
    schema: {
      example: {
        id: 'uuid',
        title: 'My Note',
        content: 'Note content',
        tags: ['work', 'important'],
        visibility: 'PRIVATE',
        authorId: 'uuid',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        author: {
          id: 'uuid',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe'
        },
        versions: [
          {
            id: 'uuid',
            noteId: 'uuid',
            title: 'My Note',
            content: 'Note content',
            version: 1,
            createdAt: '2023-01-01T00:00:00.000Z',
            createdById: 'uuid',
            createdBy: {
              id: 'uuid',
              username: 'john_doe',
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe'
            }
          }
        ],
        sharedWith: []
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this note' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    const note = await this.notesService.findOne(id, req.user.id);
    
    // Track note view
    const clientInfo = this.analyticsService.extractClientInfo(req);
    await this.analyticsService.trackNoteView({
      noteId: id,
      userId: req.user.id,
      ...clientInfo,
    });

    return note;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    schema: {
      example: {
        id: 'uuid',
        title: 'Updated Note',
        content: 'Updated content',
        tags: ['work', 'updated'],
        visibility: 'PRIVATE',
        authorId: 'uuid',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T01:00:00.000Z',
        author: {
          id: 'uuid',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe'
        },
        versions: [],
        sharedWith: []
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only author can update' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Request() req: RequestWithUser,
  ) {
    return this.notesService.update(id, updateNoteDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 204, description: 'Note deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only author can delete' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.notesService.remove(id, req.user.id);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share a note with other users' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({
    status: 200,
    description: 'Note shared successfully',
    schema: {
      example: {
        id: 'uuid',
        title: 'Shared Note',
        content: 'Note content',
        tags: ['work'],
        visibility: 'SHARED',
        authorId: 'uuid',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        author: {
          id: 'uuid',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe'
        },
        sharedWith: [
          {
            userId: 'uuid2',
            permission: 'READ',
            user: {
              id: 'uuid2',
              email: 'jane@example.com',
              firstName: 'Jane',
              lastName: 'Doe'
            }
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid user IDs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only author can share' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  shareNote(
    @Param('id') id: string,
    @Body() shareNoteDto: ShareNoteDto,
    @Request() req: RequestWithUser,
  ) {
    return this.notesService.shareNote(id, shareNoteDto.userIds, req.user.id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get all versions of a note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({
    status: 200,
    description: 'Note versions retrieved successfully',
    schema: {
      example: [
        {
          id: 'uuid',
          noteId: 'uuid',
          title: 'Note Title v2',
          content: 'Updated content',
          version: 2,
          createdAt: '2023-01-01T01:00:00.000Z',
          createdById: 'uuid',
          createdBy: {
            id: 'uuid',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe'
          }
        },
        {
          id: 'uuid2',
          noteId: 'uuid',
          title: 'Note Title v1',
          content: 'Original content',
          version: 1,
          createdAt: '2023-01-01T00:00:00.000Z',
          createdById: 'uuid',
          createdBy: {
            id: 'uuid',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this note' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  getVersions(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.notesService.getVersions(id, req.user.id);
  }

  @Post(':id/versions/:version/restore')
  @ApiOperation({ summary: 'Restore a specific version of a note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiParam({ name: 'version', description: 'Version number to restore' })
  @ApiResponse({
    status: 200,
    description: 'Note version restored successfully',
    schema: {
      example: {
        id: 'uuid',
        title: 'Restored Note Title',
        content: 'Restored content',
        tags: ['work'],
        visibility: 'PRIVATE',
        authorId: 'uuid',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T02:00:00.000Z',
        author: {
          id: 'uuid',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe'
        },
        versions: [],
        sharedWith: []
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only author can restore versions' })
  @ApiResponse({ status: 404, description: 'Note or version not found' })
  restoreVersion(
    @Param('id') id: string,
    @Param('version') version: string,
    @Request() req: RequestWithUser,
  ) {
    return this.notesService.restoreVersion(id, parseInt(version), req.user.id);
  }

  /**
   * Advanced search endpoint
   * GET /notes/search/advanced
   */
  @Get('search/advanced')
  @ApiOperation({
    summary: 'Advanced search for notes',
    description: 'Performs full-text search across note titles, descriptions, and tags with advanced filtering options.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    required: true,
    example: 'meeting notes',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'tags',
    description: 'Filter by tags (comma-separated)',
    required: false,
    example: 'work,important',
  })
  @ApiQuery({
    name: 'visibility',
    description: 'Filter by visibility',
    required: false,
    enum: ['PRIVATE', 'SHARED', 'PUBLIC'],
  })
  @ApiQuery({
    name: 'authorId',
    description: 'Filter by author ID',
    required: false,
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Sort field',
    required: false,
    example: 'updatedAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          data: [
            {
              id: 'uuid',
              title: 'Meeting Notes',
              description: 'Notes from today\'s meeting',
              visibility: 'PRIVATE',
              tags: ['work', 'meeting'],
              authorId: 'uuid',
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
              author: {
                id: 'uuid',
                name: 'John Doe',
                email: 'john@example.com',
              },
            },
          ],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      },
    },
  })
  async advancedSearch(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('tags') tags: string,
    @Query('visibility') visibility: string,
    @Query('authorId') authorId: string,
    @Query('sortBy') sortBy: string = 'updatedAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Request() req: RequestWithUser,
  ) {
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;

    const results = await this.notesService.advancedSearch(query, req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      tags: tagsArray,
      visibility,
      authorId,
      sortBy,
      sortOrder,
    });

    return {
      success: true,
      data: results,
    };
  }

  /**
   * Search suggestions endpoint
   * GET /notes/search/suggestions
   */
  @Get('search/suggestions')
  @ApiOperation({
    summary: 'Get search suggestions',
    description: 'Returns search suggestions based on user\'s notes and tags.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query (minimum 2 characters)',
    required: true,
    example: 'meet',
  })
  @ApiResponse({
    status: 200,
    description: 'Search suggestions retrieved successfully',
    schema: {
      example: {
        success: true,
        data: ['meeting', 'meetings', 'meetup'],
      },
    },
  })
  async getSearchSuggestions(
    @Query('q') query: string,
    @Request() req: RequestWithUser,
  ) {
    const suggestions = await this.notesService.getSearchSuggestions(req.user.id, query);

    return {
      success: true,
      data: suggestions,
    };
  }

  @Get('all/users')
  @ApiOperation({ summary: 'Get users to share a note' })
  @ApiResponse({ status: 200, description: 'Users to share note retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only author can share' })
  async getUsersToShareNote(
    @Request() req: RequestWithUser,
    @Query('name') name : string 
  ) {
    console.log("api started")
    const data = await this.notesService.getUsersToShareNote(req.user.id , name);

    return {
      success : true,
      data
    };
  }
}