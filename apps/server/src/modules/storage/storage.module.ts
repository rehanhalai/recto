import { Global, Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { CloudinaryStorageProvider } from "./providers/cloudinary-storage.provider";
import { STORAGE_PROVIDER } from "./interfaces/storage-provider.interface";

/**
 * StorageModule — global, singleton module.
 *
 * Any NestJS module that needs to upload or delete assets simply injects
 * StorageService directly. No need to import StorageModule everywhere since
 * it is marked @Global.
 *
 * To swap the storage backend, change the useClass below —
 * nothing else in the codebase needs to change.
 */
@Global()
@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useClass: CloudinaryStorageProvider,
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
