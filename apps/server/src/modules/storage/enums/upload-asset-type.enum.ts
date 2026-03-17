/**
 * UploadAssetType — the single lookup key that drives:
 *   1. Which Cloudinary folder the asset lands in
 *   2. Which transformation preset (resize, format, quality) is applied
 *
 * Add a new value here + a corresponding entry in ASSET_CONFIG (cloudinary.provider.ts)
 * to support a new resource — no other files need to change.
 */
export enum UploadAssetType {
  /** User profile picture — square crop, face-aware, 400 × 400 */
  USER_AVATAR = "user_avatar",

  /** User profile banner / cover — wide crop, 1200 × 400 */
  USER_COVER = "user_cover",

  /** Post inline image — bounded to 1200 wide, auto-height */
  POST_IMAGE = "post_image",
}
