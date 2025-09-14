// Files Module
// Handles file upload and storage functionality

import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { CloudinaryConfigService } from '../config/cloudinary.config';

@Module({
  providers: [
    FilesService,
    CloudinaryConfigService,
  ],
  exports: [
    FilesService,
    CloudinaryConfigService,
  ],
})
export class FilesModule {}
