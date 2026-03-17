import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "./upload.service";
import { AuthGuard } from "../common";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(AuthGuard)
  @Post("image")
  @UseInterceptors(FileInterceptor("file")) // key 'file' on the multipart/form-data payload
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadService.handlePostImageUpload(file);
  }
}
