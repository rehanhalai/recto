import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  PayloadTooLargeException,
} from "@nestjs/common";
import { ASSET_CONSTRAINTS } from "../../storage/constants/asset-constraints";
import { UploadAssetType } from "../../storage/enums/upload-asset-type.enum";

@Injectable()
export class FileValidatorPipe implements PipeTransform {
  constructor(private readonly assetType: UploadAssetType) {}

  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!file) {
      return undefined;
    }

    const constraints = ASSET_CONSTRAINTS[this.assetType];

    if (file.size > constraints.maxSizeBytes) {
      const limitMb = constraints.maxSizeBytes / (1024 * 1024);
      throw new PayloadTooLargeException(
        `File size exceeds the ${limitMb} MB limit for ${this.assetType}.`,
      );
    }

    if (!constraints.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type "${file.mimetype}". Allowed: ${constraints.allowedMimeTypes.join(", ")}.`,
      );
    }

    return file;
  }
}
