import { Module } from "@nestjs/common";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";

// StorageService is provided globally by StorageModule (registered in AppModule).
// No need to import StorageModule here.
@Module({
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
