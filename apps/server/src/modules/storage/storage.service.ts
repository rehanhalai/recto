import {
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
  Logger,
  Inject,
} from "@nestjs/common";
import type { IStorageProvider } from "./interfaces/storage-provider.interface";
import { STORAGE_PROVIDER } from "./interfaces/storage-provider.interface";
import { UploadAssetType } from "./enums/upload-asset-type.enum";
import type {
  UploadOptions,
  UploadResult,
} from "./interfaces/upload-options.interface";

// ---------------------------------------------------------------------------
// Per-asset validation constraints
// ---------------------------------------------------------------------------

interface AssetConstraints {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
}

const ASSET_CONSTRAINTS: Record<UploadAssetType, AssetConstraints> = {
  [UploadAssetType.USER_AVATAR]: {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  [UploadAssetType.USER_COVER]: {
    maxSizeBytes: 8 * 1024 * 1024, // 8 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  [UploadAssetType.POST_IMAGE]: {
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
};

// ---------------------------------------------------------------------------

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  /**
   * StorageService depends on the IStorageProvider abstraction.
   * The concrete implementation (CloudinaryStorageProvider) is injected
   * via the STORAGE_PROVIDER token — callers are always decoupled from Cloudinary.
   */
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {}

  /**
   * Validate and upload a file for a specific asset context.
   *
   * @param file      - The raw Multer file from the request
   * @param assetType - Which asset category is being uploaded (drives folder + transforms)
   * @param subFolder - Optional user/entity ID for per-entity bucketing
   */
  async upload(
    file: Express.Multer.File,
    assetType: UploadAssetType,
    subFolder?: string,
  ): Promise<UploadResult> {
    this.validateFile(file, assetType);

    const options: UploadOptions = { assetType, subFolder };
    const result = await this.storageProvider.upload(file, options);

    this.logger.log(`Uploaded ${assetType} → publicId: ${result.publicId}`);

    return result;
  }

  /**
   * Delete an asset from the storage provider using its public ID.
   * Silently succeeds if publicId is empty.
   */
  async delete(publicId: string): Promise<void> {
    if (!publicId) return;
    await this.storageProvider.delete(publicId);
    this.logger.log(`Deleted asset publicId: ${publicId}`);
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  private validateFile(
    file: Express.Multer.File,
    assetType: UploadAssetType,
  ): void {
    if (!file) {
      throw new BadRequestException("No file was provided.");
    }

    const constraints = ASSET_CONSTRAINTS[assetType];

    if (file.size > constraints.maxSizeBytes) {
      const limitMb = constraints.maxSizeBytes / (1024 * 1024);
      throw new PayloadTooLargeException(
        `File size exceeds the ${limitMb} MB limit for ${assetType}.`,
      );
    }

    if (!constraints.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type "${file.mimetype}". Allowed: ${constraints.allowedMimeTypes.join(", ")}.`,
      );
    }
  }
}
