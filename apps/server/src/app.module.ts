import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CommonModule } from "./modules/common/common.module";
import { BookModule } from "./modules/book/book.module";
import { ReviewModule } from "./modules/review/review.module";
import { PostsModule } from "./modules/posts/posts.module";
import { FeedModule } from "./modules/feed/feed.module";
import { UploadModule } from "./modules/upload/upload.module";
import { StorageModule } from "./modules/storage/storage.module";
import { MailModule } from "./modules/mail/mail.module";
import { OtpModule } from "./modules/otp/otp.module";
import { ReadingTrackerModule } from "./modules/reading-tracker/reading-tracker.module";

import { DbModule } from "../db/db.module";
import config from "./config/config";

@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    AuthModule,
    UserModule,
    BookModule,
    CommonModule,
    ReviewModule,
    PostsModule,
    FeedModule,
    UploadModule,
    StorageModule,
    MailModule,
    OtpModule,
    ReadingTrackerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
