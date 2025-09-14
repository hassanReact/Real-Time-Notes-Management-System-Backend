// File Upload Service
// Handles file uploads to Cloudinary with validation and processing

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CloudinaryConfigService } from '../config/cloudinary.config';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadResult {
  url: string;
  publicId: string;
  size: number;
  contentType: string;
  originalName: string;
  secureUrl: string;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    private cloudinaryConfigService: CloudinaryConfigService,
    private configService: ConfigService,
  ) {
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE') || 5 * 1024 * 1024; // 5MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    userId?: string,
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique public ID
      const fileExtension = this.getFileExtension(file.originalname);
      const fileName = `${uuidv4()}`;
      const publicId = userId ? `${folder}/${userId}/${fileName}` : `${folder}/${fileName}`;

      // Upload to Cloudinary
      const result = await this.cloudinaryConfigService.uploadFile(
        file.buffer,
        folder,
        publicId,
      );

      this.logger.log(`File uploaded successfully: ${publicId}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        size: file.size,
        contentType: file.mimetype,
        originalName: file.originalname,
        secureUrl: result.secure_url,
      };
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
    userId?: string,
  ): Promise<FileUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder, userId));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      await this.cloudinaryConfigService.deleteFile(publicId);
      this.logger.log(`File deleted successfully: ${publicId}`);
    } catch (error) {
      this.logger.error(`File deletion failed: ${error.message}`);
      throw new BadRequestException(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Get signed URL for file access
   */
  async getFileUrl(publicId: string, expiresIn: number = 3600): Promise<string> {
    try {
      return await this.cloudinaryConfigService.getSignedUrl(publicId, expiresIn);
    } catch (error) {
      this.logger.error(`Failed to generate file URL: ${error.message}`);
      throw new BadRequestException(`Failed to generate file URL: ${error.message}`);
    }
  }

  /**
   * Get transformed image URL
   */
  getTransformedImageUrl(publicId: string, transformations: any = {}): string {
    return this.cloudinaryConfigService.getTransformedUrl(publicId, transformations);
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  /**
   * Extract file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex + 1).toLowerCase() : '';
  }

  /**
   * Generate file public ID for Cloudinary
   */
  generateFilePublicId(originalName: string, folder: string, userId?: string): string {
    const fileExtension = this.getFileExtension(originalName);
    const fileName = `${uuidv4()}`;
    return userId ? `${folder}/${userId}/${fileName}` : `${folder}/${fileName}`;
  }
}
