import { Module, Global } from "@nestjs/common";

// Guards and decorators live here. Storage has moved to StorageModule.
@Global()
@Module({})
export class CommonModule {}
