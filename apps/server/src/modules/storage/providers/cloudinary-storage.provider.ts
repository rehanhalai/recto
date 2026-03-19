import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import { IStorageProvider } from "../interfaces/storage-provider.interface";
import {
  UploadOptions,
  UploadResult,
} from "../interfaces/upload-options.interface";
import { UploadAssetType } from "../enums/upload-asset-type.enum";

// ---------------------------------------------------------------------------
// Asset configuration map
// Each entry defines the Cloudinary folder and the transformation pipeline
// applied automatically on every upload for that asset type.
// ---------------------------------------------------------------------------

interface AssetConfig {
  folder: string;
  transformation: object[];
}

const ASSET_CONFIG: Record<UploadAssetType, AssetConfig> = {
  [UploadAssetType.USER_AVATAR]: {
    folder: "recto/avatars",
    transformation: [
      {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face",
        quality: "auto:good",
        format: "webp",
      },
    ],
  },

  [UploadAssetType.USER_COVER]: {
    folder: "recto/covers",
    transformation: [
      {
        width: 1200,
        height: 400,
        crop: "fill",
        gravity: "auto",
        quality: "auto:good",
        format: "webp",
      },
    ],
  },

  [UploadAssetType.POST_IMAGE]: {
    folder: "recto/posts",
    transformation: [
      {
        width: 1200,
        crop: "limit",
        quality: "auto:eco",
        format: "webp",
      },
    ],
  },
};

// ---------------------------------------------------------------------------

@Injectable()
export class CloudinaryStorageProvider
  implements IStorageProvider, OnModuleInit
{
  private readonly logger = new Logger(CloudinaryStorageProvider.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    cloudinary.config({
      cloud_name: this.configService.get<string>("cloudinary.cloudName"),
      api_key: this.configService.get<string>("cloudinary.apiKey"),
      api_secret: this.configService.get<string>("cloudinary.apiSecret"),
      secure: true,
    });

    this.logger.log("Cloudinary configured successfully");
  }

  async upload(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const config = ASSET_CONFIG[options.assetType];
    const folder = options.subFolder
      ? `${config.folder}/${options.subFolder}`
      : config.folder;

    try {
      const result = await this.uploadStream(file.buffer, {
        folder,
        transformation: config.transformation,
        resource_type: "image",
        overwrite: true,
        format: "webp",
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      this.logger.error(
        `Cloudinary upload failed for asset type "${options.assetType}"`,
        error,
      );
      throw new InternalServerErrorException(
        "File upload failed. Please try again.",
      );
    }
  }

  async delete(publicId: string): Promise<void> {
    if (!publicId) return;

    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (error) {
      // Deletion failures are logged but not surfaced — a missing asset
      // in Cloudinary should never hard-fail a user-facing operation.
      this.logger.warn(
        `Cloudinary delete silently failed for publicId "${publicId}"`,
        error,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Wraps Cloudinary's callback-based upload_stream in a Promise so it
   * integrates cleanly with async/await without blocking the event loop.
   * Uses Node.js Readable.from() to stream the in-memory buffer.
   */
  private uploadStream(
    buffer: Buffer,
    uploadOptions: object,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error || !result) {
            return reject(error ?? new Error("No result from Cloudinary"));
          }
          resolve(result);
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }
}
