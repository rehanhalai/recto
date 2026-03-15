import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { DbModule } from "../../../db/db.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { OtpModule } from "../otp/otp.module";
import { MailModule } from "../mail/mail.module";
import { GoogleStrategy } from "./strategies/google.strategy";

@Module({
  imports: [
    DbModule,
    OtpModule,
    MailModule,
    PassportModule.register({ defaultStrategy: "google" }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
