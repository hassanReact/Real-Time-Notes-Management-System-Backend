// Cloudinary Configuration
// Handles Cloudinary client setup for file storage

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

/**
 * Cloudinary Configuration Service
 * Provides centralized access to Cloudinary configuration values
 */
@Injectable()
export class CloudinaryConfigService {
  private cloudinaryStorage: CloudinaryStorage;

  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    // Configure Cloudinary Storage for Multer
    this.cloudinaryStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: () => ({
        folder: 'notes-management',
        format: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt'],
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' }, // Resize images
          { quality: 'auto' }, // Auto quality optimization
        ],
      }),
    });
  }

  /**
   * Get Cloudinary instance
   */
  getCloudinary() {
    return cloudinary;
  }

  /**
   * Get Cloudinary Storage instance
   */
  getCloudinaryStorage(): CloudinaryStorage {
    return this.cloudinaryStorage;
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadFile(file: Buffer, folder: string = 'notes-management', publicId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'auto',
          quality: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(file);
    });
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  /**
   * Generate signed URL for file access
   */
  async getSignedUrl(publicId: string, expiresIn: number = 3600): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
    // The third argument is the options object, the second is the format (null for default)
    return cloudinary.utils.private_download_url(publicId, null, {
      expires_at: expiresAt,
    });
  }

  /**
   * Transform image URL
   */
  getTransformedUrl(publicId: string, transformations: any = {}): string {
    return cloudinary.url(publicId, {
      ...transformations,
      secure: true,
    });
  }
}
