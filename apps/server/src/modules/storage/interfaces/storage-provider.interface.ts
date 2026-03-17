import { UploadResult, UploadOptions } from "./upload-options.interface";

/**
 * IStorageProvider — abstraction boundary for any file storage backend.
 * Concrete implementations (Cloudinary, S3, R2, etc.) must implement this.
 * Consumers always depend on this interface, never on a concrete class.
 */
export interface IStorageProvider {
  /**
   * Upload a raw Multer file with context-aware options.
   * Returns a fully resolved public URL and the provider-specific asset ID.
   */
  upload(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult>;

  /**
   * Permanently delete an asset by its provider-specific public ID.
   * Silently succeeds if the asset does not exist.
   */
  delete(publicId: string): Promise<void>;
}

export const STORAGE_PROVIDER = Symbol("STORAGE_PROVIDER");
