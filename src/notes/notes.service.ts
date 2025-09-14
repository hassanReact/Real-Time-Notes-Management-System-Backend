import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { Prisma, Note, NoteVersion, User } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) { }

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    return this.prisma.$transaction(async (tx) => {
      // Create the note
      const note = await tx.note.create({
        data: {
          title: createNoteDto.title,
          description: createNoteDto.description,
          tags: createNoteDto.tags || [],
          visibility: createNoteDto.visibility || 'PRIVATE',
          authorId: userId,
        },
      });

      // Create initial version
      await tx.noteVersion.create({
        data: {
          noteId: note.id,
          title: note.title,
          description: note.description,
          version: 1,
          createdBy: userId,
        },
      });

      // Return the note with relations
      const fullNote = await tx.note.findUniqueOrThrow({
        where: { id: note.id },
        include: {
          author: {
            select: { id: true, email: true, name: true },
          },
          versions: {
            orderBy: { version: 'desc' }
          },
          noteUsers: {
            include: {
              user: {
                select: { id: true, email: true, name: true },
              },
            },
          },
        },
      });

      return fullNote;
    });
  }

  async findAll(queryDto: QueryNotesDto, userId: string) {
    const {
      page = 1,
      limit = 10,
      search,
      tags,
      visibility,
      authorId,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = queryDto;

    const skip = (page - 1) * limit;
    const where: Prisma.NoteWhereInput = {
      AND: [
        {
          OR: [
            { authorId: userId },
            { visibility: 'PUBLIC' },
            {
              AND: [
                { visibility: 'SHARED' },
                {
                  noteUsers: {
                    some: { userId }
                  }
                }
              ]
            }
          ]
        },
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        tags?.length ? { tags: { hasSome: tags } } : {},
        visibility ? { visibility } : {},
        authorId ? { authorId } : {}
      ]
    };

    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: { id: true, email: true, name: true }
          },
          noteUsers: {
            include: {
              user: {
                select: { id: true, email: true, name: true }
              }
            }
          },
          _count: {
            select: { versions: true }
          }
        }
      }),
      this.prisma.note.count({ where })
    ]);

    return {
      data: notes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, email: true, name: true }
        },
        versions: {
          orderBy: { version: 'desc' }
        },
        noteUsers: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        }
      }
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Check if user has access to this note
    const hasAccess =
      note.authorId === userId ||
      note.visibility === 'PUBLIC' ||
      (note.visibility === 'SHARED' && note.noteUsers.some(share => share.userId === userId));

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this note');
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: string): Promise<Note> {
    const existingNote = await this.findOne(id, userId);

    // Only author can update the note
    if (existingNote.authorId !== userId) {
      throw new ForbiddenException('Only the author can update this note');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedNote = await tx.note.update({
        where: { id },
        data: {
          title: updateNoteDto.title ?? existingNote.title,
          description: updateNoteDto.description ?? existingNote.description,
          tags: updateNoteDto.tags ?? existingNote.tags,
          visibility: updateNoteDto.visibility ?? existingNote.visibility,
        },
        include: {
          author: {
            select: { id: true, email: true, name: true }
          },
          versions: {
            orderBy: { version: 'desc' }
          },
          noteUsers: {
            include: {
              user: {
                select: { id: true, email: true, name: true }
              }
            }
          }
        }
      });

      // Create new version if description or title changed
      if (
        (updateNoteDto.title !== undefined && updateNoteDto.title !== existingNote.title) ||
        (updateNoteDto.description !== undefined && updateNoteDto.description !== existingNote.description)
      ) {
        const latestVersion = await tx.noteVersion.findFirst({
          where: { noteId: id },
          orderBy: { version: 'desc' }
        });

        await tx.noteVersion.create({
          data: {
            noteId: id,
            title: updatedNote.title,
            description: updatedNote.description,
            version: (latestVersion?.version || 0) + 1,
            createdBy: userId,
          }
        });
      }

      return updatedNote;
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.findOne(id, userId);

    // Only author can delete the note
    if (note.authorId !== userId) {
      throw new ForbiddenException('Only the author can delete this note');
    }

    await this.prisma.note.delete({
      where: { id }
    });
  }

  async getUsersToShareNote(userId: string, name: string) {
    const data = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: 'USER',
        id: { not: userId },
        ...(name
          ? {
            name: {
              contains: name,
              mode: 'insensitive',
            },
          }
          : {}), // only apply if name exists
      },
      select: { id: true, name: true, email: true, profilePicture: true },
    });


    console.log(data);
    if (!data) {
      console.log(data)
      throw new BadRequestException("Data not Found")
    }

    return data
  }

  async shareNote(noteId: string, userIds: string[], userId: string): Promise<Note> {
    const note = await this.findOne(noteId, userId);

    // Only author can share the note
    if (note.authorId !== userId) {
      throw new ForbiddenException('Only the author can share this note');
    }

    // Validate that all user IDs exist
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } }
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException('One or more users not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Remove existing shares
      await tx.noteUser.deleteMany({
        where: { noteId }
      });

      // Add new shares
      if (userIds.length > 0) {
        await tx.noteUser.createMany({
          data: userIds.map(uid => ({
            noteId,
            userId: uid,
            permission: 'VIEW'
          })) as any // Cast to any to satisfy type, or adjust Permission type if possible
        });
      }

      // Update note visibility to SHARED if it's PRIVATE
      if (note.visibility === 'PRIVATE') {
        await tx.note.update({
          where: { id: noteId },
          data: { visibility: 'SHARED' }
        });
      }

      return tx.note.findUnique({
        where: { id: noteId },
        include: {
          author: {
            select: { id: true, email: true, name: true }
          },
          noteUsers: {
            include: {
              user: {
                select: { id: true, email: true, name: true }
              }
            }
          }
        }
      });
    });
  }

  async getVersions(noteId: string, userId: string): Promise<NoteVersion[]> {
    await this.findOne(noteId, userId); // Check access

    return this.prisma.noteVersion.findMany({
      where: { noteId },
      orderBy: { version: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async restoreVersion(noteId: string, version: number, userId: string): Promise<Note> {
    const note = await this.findOne(noteId, userId);

    // Only author can restore versions
    if (note.authorId !== userId) {
      throw new ForbiddenException('Only the author can restore note versions');
    }

    const targetVersion = await this.prisma.noteVersion.findFirst({
      where: { noteId, version }
    });

    if (!targetVersion) {
      throw new NotFoundException('Version not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedNote = await tx.note.update({
        where: { id: noteId },
        data: {
          title: targetVersion.title,
          description: targetVersion.description,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          versions: {
            orderBy: { version: 'desc' }
          },
          noteUsers: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      // Create new version for the restoration
      const latestVersion = await tx.noteVersion.findFirst({
        where: { noteId },
        orderBy: { version: 'desc' }
      });

      await tx.noteVersion.create({
        data: {
          noteId,
          title: targetVersion.title,
          description: targetVersion.description,
          version: (latestVersion?.version || 0) + 1,
          createdBy: userId,
        }
      });

      return updatedNote;
    });
  }

  /**
   * Advanced search with full-text search capabilities
   */
  async advancedSearch(
    query: string,
    userId: string,
    options: {
      page?: number;
      limit?: number;
      tags?: string[];
      visibility?: string;
      authorId?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ) {
    const {
      page = 1,
      limit = 10,
      tags,
      visibility,
      authorId,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions: Prisma.NoteWhereInput[] = [];

    // Full-text search in title and description
    if (query) {
      searchConditions.push({
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
          // Search in tags
          {
            tags: {
              hasSome: [query],
            },
          },
        ],
      });
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      searchConditions.push({
        tags: {
          hasSome: tags,
        },
      });
    }

    // Filter by visibility
    if (visibility) {
      searchConditions.push({
        visibility: visibility as any,
      });
    }

    // Filter by author
    if (authorId) {
      searchConditions.push({
        authorId,
      });
    }

    // Access control - user can only see their own notes, public notes, or shared notes
    const accessControl: Prisma.NoteWhereInput = {
      OR: [
        { authorId: userId },
        { visibility: 'PUBLIC' },
        {
          AND: [
            { visibility: 'SHARED' },
            {
              noteUsers: {
                some: { userId }
              }
            }
          ]
        }
      ]
    };

    const where: Prisma.NoteWhereInput = {
      AND: [
        accessControl,
        ...searchConditions,
      ],
    };

    // Execute search with pagination
    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          versions: {
            orderBy: { version: 'desc' },
            take: 1, // Only get latest version for search results
          },
          noteUsers: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          _count: {
            select: {
              versions: true,
              noteUsers: true,
            }
          }
        }
      }),
      this.prisma.note.count({ where }),
    ]);

    return {
      data: notes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search suggestions based on user's notes
   */
  async getSearchSuggestions(userId: string, query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const notes = await this.prisma.note.findMany({
      where: {
        AND: [
          {
            OR: [
              { authorId: userId },
              { visibility: 'PUBLIC' },
              {
                AND: [
                  { visibility: 'SHARED' },
                  {
                    noteUsers: {
                      some: { userId }
                    }
                  }
                ]
              }
            ]
          },
          {
            OR: [
              {
                title: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      select: {
        title: true,
        tags: true,
      },
      take: 10,
    });

    const suggestions = new Set<string>();

    notes.forEach(note => {
      // Add title words that match
      const titleWords = note.title.toLowerCase().split(/\s+/);
      titleWords.forEach(word => {
        if (word.includes(query.toLowerCase()) && word.length > 2) {
          suggestions.add(word);
        }
      });

      // Add matching tags
      note.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, 8);
  }
}