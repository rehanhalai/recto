import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule], // To inject StorageService
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
