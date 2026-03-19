import { UploadAssetType } from "../enums/upload-asset-type.enum";

export interface AssetConstraints {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
}

export const ASSET_CONSTRAINTS: Record<UploadAssetType, AssetConstraints> = {
  [UploadAssetType.USER_AVATAR]: {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  [UploadAssetType.USER_COVER]: {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  [UploadAssetType.POST_IMAGE]: {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
};
