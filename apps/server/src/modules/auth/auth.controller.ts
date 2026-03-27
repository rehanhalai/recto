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
import type { Request, Response, CookieOptions } from "express";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import type { GoogleAuthUser, RequestMeta } from "./auth.service";
import {
  SignUpDto,
  SignInDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  NewPasswordDto,
  ChangePasswordDto,
} from "./dto/auth.dto";
import { AuthGuard, CurrentUser } from "../common";
import type { AuthenticatedRequestUser } from "../common";
import { SESSION_COOKIE_NAME, SESSION_EXPIRE_TIME } from "../../constants";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getSessionCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get<string>("nodeEnv") === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRE_TIME,
    };
  }

  private getRequestMeta(req: Request): RequestMeta {
    return {
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] ?? null,
    };
  }

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
    const meta = this.getRequestMeta(req);
    const { sessionToken, userData } =
      await this.authService.verifyOtpAndSignUp(dto, meta);

    res.cookie(
      SESSION_COOKIE_NAME,
      sessionToken,
      this.getSessionCookieOptions(),
    );

    return {
      user: userData,
      message: "User verified successfully",
    };
  }

  @Post("signin")
  async signin(
    @Body() dto: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sessionToken, userData } = await this.authService.signIn(
      dto,
      this.getRequestMeta(req),
    );

    res.cookie(
      SESSION_COOKIE_NAME,
      sessionToken,
      this.getSessionCookieOptions(),
    );

    return {
      user: userData,
      message: "User logged in successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Post("logout")
  async logout(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.revokeSession(user.sessionId);

    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: this.configService.get<string>("nodeEnv") === "production",
      sameSite: "lax",
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
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.resetPassWithOldPass(
      user.id,
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
    @Req() req: Request & { user?: GoogleAuthUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sessionToken } = await this.authService.googleAuthCallback(
      req.user as GoogleAuthUser,
      this.getRequestMeta(req),
    );

    res.cookie(
      SESSION_COOKIE_NAME,
      sessionToken,
      this.getSessionCookieOptions(),
    );

    const clientUrl =
      this.configService.get<string>("clientUrl") || "http://localhost:3000";
    const redirectUrl = new URL("/feed", clientUrl).toString();
    return res.redirect(redirectUrl);
  }

  @UseGuards(AuthGuard)
  @Get("me")
  async getCurrentUser(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.authService.getCurrentUser(user.id);
  }
}
