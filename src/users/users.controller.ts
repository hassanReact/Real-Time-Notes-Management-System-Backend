// Users Controller - Ye file users ke saath related saare kaam handle karti hai
// Jaise profile dekhna, update karna, avatar upload karna, aur users search karna

import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FilesService } from '../files/files.service';
import {
  UserProfileResponseDto,
  UserSearchResponseDto,
} from './dto/user-response.dto';
import {
  UnauthorizedErrorResponseDto,
  ValidationErrorResponseDto,
  NotFoundErrorResponseDto,
} from '../common/dto/error-response.dto';
import { User } from '@prisma/client';

/**
 * Users Controller - Ye main controller hai users ke liye
 * Yahan saare REST API endpoints hain jo users ke kaam aate hain
 * Jaise profile management, avatar upload, user search waghaira
 */
@ApiTags('Users') // Swagger mein ye "Users" section banayega
@Controller('users') // Ye batata hai ke saare routes "/users" se start honge
@ApiBearerAuth('JWT-auth') // Ye batata hai ke JWT token chahiye authentication ke liye
export class UsersController {
  // Constructor mein UsersService aur FilesService inject kar rahe hain
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) { }

  /**
   * Current user ka profile get karne ke liye - GET /users/profile
   * Ye function logged in user ki saari details return karta hai
   */
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the complete profile information for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundErrorResponseDto
  })
  @Get('profile') // GET request handle karta hai "/users/profile" pe
  async getProfile(@CurrentUser() user: User) {
    console.log('user', user);
    const profile = await this.usersService.getProfile(user.id);

    // Profile return kar rahe hain response mein
    return profile;
  }

  /**
   * User ka profile update karne ke liye - PUT /users/profile
   * User apna naam, phone number waghaira change kar sakta hai
   */
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates the profile information for the authenticated user'
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Profile update data',
    examples: {
      example1: {
        summary: 'Update name and phone',
        value: {
          name: 'John Doe Updated',
          phone: '+1987654321'
        }
      },
      example2: {
        summary: 'Update name only',
        value: {
          name: 'Jane Smith'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserProfileResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ValidationErrorResponseDto
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundErrorResponseDto
  })
  @Put('profile') // PUT request handle karta hai profile update ke liye
  async updateProfile(
    @CurrentUser() user: User, // Current logged in user
    @Body() updateProfileDto: UpdateProfileDto, // Request body mein jo data aaya hai
  ) {
    // UsersService se profile update kar rahe hain
    // User ki ID aur new data pass kar rahe hain
    const updatedProfile = await this.usersService.updateProfile(
      user.id,
      updateProfileDto,
    );

    // Updated profile return kar rahe hain
    return updatedProfile;
  }

  /**
   * User ka avatar/profile picture upload karne ke liye - POST /users/upload-avatar
   * User apni photo upload kar sakta hai jo uski profile mein show hogi
   */
  @ApiOperation({
    summary: 'Upload user avatar',
    description: 'Uploads a new profile picture for the authenticated user'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Profile picture file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (JPEG, PNG, GIF)'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            profilePicture: {
              type: 'string',
              example: 'https://example.com/avatars/user123.jpg'
            }
          }
        },
        message: { type: 'string', example: 'Avatar uploaded successfully' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid file or upload failed',
    type: ValidationErrorResponseDto
  })
  @Post('upload-avatar') // POST request handle karta hai avatar upload ke liye
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // File size limit - 5MB tak ki file allow hai
    },
    fileFilter: (req: any, file: any, callback: any) => {
      // Sirf image files allow kar rahe hain (jpg, jpeg, png, gif)
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Sirf image files allowed hain'), false);
      }
      callback(null, true); // File accept kar rahe hain
    },
  }))
  async uploadAvatar(
    @CurrentUser() user: User, // Current logged in user
    @UploadedFile() file?: Express.Multer.File, // Uploaded file ka data (optional)
  ) {
    // Check kar rahe hain ke file upload hui hai ya nahi
    if (!file) {
      throw new BadRequestException('Koi file upload nahi hui');
    }

    // Upload file to Cloudinary
    const uploadResult = await this.filesService.uploadFile(file, 'avatars', user.id);

    // Update user profile with new avatar URL
    const result = await this.usersService.uploadAvatar(user.id, uploadResult.secureUrl);

    return {
      ...result,
      uploadDetails: {
        publicId: uploadResult.publicId,
        originalName: uploadResult.originalName,
        size: uploadResult.size,
      },
    };
  }

  /**
   * Users ko search karne ke liye - GET /users/search
   * Jab koi note share karna chahta hai to dusre users dhundh sakta hai
   */
  @ApiOperation({
    summary: 'Search users for sharing',
    description: 'Searches for users by name or email for note sharing functionality'
  })
  @ApiQuery({
    name: 'query',
    description: 'Search query for user name or email',
    example: 'john',
    required: false
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of results (1-50)',
    example: 10,
    required: false
  })
  @ApiResponse({
    status: 200,
    description: 'Users found successfully',
    type: UserSearchResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid search parameters',
    type: ValidationErrorResponseDto
  })
  @Get('search') // GET request handle karta hai users search ke liye
  async searchUsers(@Query() searchDto: UserSearchDto) {
    // Query parameters mein search term aata hai (jaise naam ya email)
    // UsersService se users search kar rahe hain
    const searchResults = await this.usersService.searchUsers(searchDto);

    // Search results return kar rahe hain
    return searchResults;
  }

  /**
   * Change user password
   * Allows authenticated users to change their account password
   */
  @ApiOperation({
    summary: 'Change user password',
    description: 'Allows authenticated users to change their account password'
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Password change data',
    examples: {
      example1: {
        summary: 'Change password request',
        value: {
          currentPassword: 'currentPass123',
          newPassword: 'newPass123',
          confirmPassword: 'newPass123'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully'
  })
  @ApiUnauthorizedResponse({
    description: 'Current password is incorrect',
    type: UnauthorizedErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid password data',
    type: ValidationErrorResponseDto
  })
  @Put('change/password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    await this.usersService.changePassword(user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  /**
   * Delete user account
   * Allows authenticated users to delete their account
   */
  @ApiOperation({
    summary: 'Delete user account',
    description: 'Permanently deletes the authenticated user\'s account'
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully'
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Account deletion failed',
    type: ValidationErrorResponseDto
  })
  @Put('delete/account')
  async deleteAccount(@CurrentUser() user: User) {
    await this.usersService.deleteAccount(user.id);
    return { message: 'Account deleted successfully' };
  }
}