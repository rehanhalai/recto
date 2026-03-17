import { UploadAssetType } from "../enums/upload-asset-type.enum";

/**
 * Options passed to the storage provider on every upload call.
 * The asset type drives folder routing AND transformation presets.
 */
export interface UploadOptions {
  assetType: UploadAssetType;
  /**
   * Optional sub-folder suffix appended after the base folder.
   * e.g. a userId so assets are bucketed per-user.
   */
  subFolder?: string;
}

/**
 * Resolved result returned to the caller after a successful upload.
 */
export interface UploadResult {
  /** CDN-ready public URL (with transformations already baked in for images). */
  url: string;
  /** Provider's internal asset identifier — required for future deletions. */
  publicId: string;
}
