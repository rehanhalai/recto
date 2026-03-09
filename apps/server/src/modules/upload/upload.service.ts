import { Injectable, BadRequestException } from '@nestjs/common';
import { StorageService } from '../common/storage.service';

@Injectable()
export class UploadService {
  constructor(private readonly storageService: StorageService) {}

  async handleImageUpload(file: Express.Multer.File): Promise<{ url: string }> {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds limit');
    }

    // Validate size or mimetype if necessary
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only images are allowed');
    }

    const fileUrl = await this.storageService.uploadFile(file, 'posts/images');
    return { url: fileUrl };
  }
}
