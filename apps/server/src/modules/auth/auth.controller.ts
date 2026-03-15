import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard as NestAuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import type { JwtPayload } from "./auth.service";
import {
  SignUpDto,
  SignInDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  NewPasswordDto,
  ChangePasswordDto,
} from "./dto/auth.dto";
import { AuthGuard, CurrentUser } from "../common";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("signup")
  async signup(@Body() dto: SignUpDto) {
    const response = await this.authService.signUp(dto);
    return {
      ...response,
      message: "OTP sent successfully",
    };
  }

  @Post("signup-verify")
  async signupVerify(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta: { ipAddress: string | null; userAgent: string | null } = {
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] ?? null,
    };
    const { sessionToken, userData } =
      await this.authService.verifyOtpAndSignUp(dto, meta);
    res.cookie("session_id", sessionToken, {
      httpOnly: true,
      secure: this.configService.get<string>("nodeEnv") === "production",
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      user: userData,
      message: "User verified successfully",
    };
  }

  @Post("signin")
  async signin(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, userData } = await this.authService.signIn(dto);
    res.cookie("token", token, {
      httpOnly: true,
      secure: this.configService.get<string>("nodeEnv") === "production",
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      user: userData,
      message: "User logged in successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Post("logout")
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie("session_id", {
      httpOnly: true,
      secure: this.configService.get<string>("nodeEnv") === "production",
      sameSite: "lax" as const,
    });
    return {
      message: "User logged out successfully",
    };
  }

  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const message = await this.authService.forgotPassword(dto.email);
    return { message };
  }

  @Post("reset-password")
  async resetPassword(@Body() dto: NewPasswordDto) {
    await this.authService.resetPassword(dto.resetToken, dto.password);
    return {
      message: "Password updated successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Post("change-password")
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.resetPassWithOldPass(
      user._id,
      dto.oldPassword,
      dto.newPassword,
    );
    return {
      message: "Password changed successfully",
    };
  }

  @Get("google")
  @UseGuards(NestAuthGuard("google"))
  async googleAuthRedirect() {
    // Passport handles redirect
  }

  @Get("google/callback")
  @UseGuards(NestAuthGuard("google"))
  async googleAuthCallback(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, userData } = await this.authService.googleAuthCallback(req);

    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: this.configService.get<string>("nodeEnv") === "production",
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const clientUrl = this.configService.get<string>("clientUrl") || "/";
    // Redirect back to frontend with some success indicator if needed,
    // or just the generic dashboard since cookie is set
    return res.redirect(clientUrl);
  }
}
