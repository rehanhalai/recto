import { Injectable, BadRequestException } from "@nestjs/common";
import { StorageService } from "../storage/storage.service";
import { UploadAssetType } from "../storage/enums/upload-asset-type.enum";

@Injectable()
export class UploadService {
  constructor(private readonly storageService: StorageService) {}

  async handlePostImageUpload(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    const result = await this.storageService.upload(
      file,
      UploadAssetType.POST_IMAGE,
    );

    return { url: result.url, publicId: result.publicId };
  }
}
