import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { extname } from 'path';

// Note: Ensure @types/multer is installed

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('storage.bucketName')!;
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('storage.endpoint'),
      credentials: {
        accessKeyId: this.configService.get<string>('storage.accessKeyId')!,
        secretAccessKey: this.configService.get<string>(
          'storage.secretAccessKey',
        )!,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${folder}/${uniqueSuffix}${ext}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const publicUrl = this.configService.get<string>('storage.publicUrl')!;
      return `${publicUrl}/${filename}`;
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) return;
      const publicUrl = this.configService.get<string>('storage.publicUrl')!;

      // Basic check to see if it's our domain
      if (!fileUrl.startsWith(publicUrl)) return;

      const key = fileUrl.replace(`${publicUrl}/`, '');

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('Error deleting from R2:', error);
    }
  }
}
