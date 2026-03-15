import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../../../db/db.module";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../../../db/schema";
import { users } from "../../../db/schema";
import { SignUpDto, VerifyOtpDto, SignInDto } from "./dto/auth.dto";
import { SESSION_EXPIRE_TIME, USER_SELECT_FIELDS } from "../../constants";
import { OtpService } from "../otp/otp.service";
import { MailService } from "../mail/mail.service";

export interface SessionTokenPayload {
  sub: string;
  sid: string;
}

interface PasswordResetTokenPayload {
  email?: string;
  purpose?: string;
}

export interface RequestMeta {
  ipAddress: string | null;
  userAgent: string | null;
}

export interface GoogleAuthUser {
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  googleId: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  private get tokenSecret(): string {
    return this.configService.get<string>("refreshToken.secret")!;
  }

  private get tokenExpire(): string {
    return this.configService.get<string>("refreshToken.expire")!;
  }

  private generateSessionToken(payload: SessionTokenPayload) {
    return jwt.sign(payload, this.tokenSecret, {
      expiresIn: this.tokenExpire as jwt.SignOptions["expiresIn"],
    });
  }

  private generatePasswordResetToken(email: string) {
    return jwt.sign({ email, purpose: "password-reset" }, this.tokenSecret, {
      expiresIn: this.tokenExpire as jwt.SignOptions["expiresIn"],
    });
  }

  private getUserData(user: typeof schema.users.$inferSelect) {
    return {
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
      avatarImage: user.avatarImage,
      coverImage: user.coverImage,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  private createTempUserName() {
    return "user_" + crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  }

  private async createSession(userId: string, meta: RequestMeta) {
    const [session] = await this.db
      .insert(schema.sessions)
      .values({
        userId,
        expiresAt: new Date(Date.now() + SESSION_EXPIRE_TIME),
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      })
      .returning({ id: schema.sessions.id });

    return session;
  }

  private async issueSessionToken(userId: string, meta: RequestMeta) {
    const session = await this.createSession(userId, meta);
    return this.generateSessionToken({ sub: userId, sid: session.id });
  }

  async signUp(dto: SignUpDto) {
    const { email, password } = dto;
    const existingEmail = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingEmail)
      throw new ConflictException("User with this email already exists ");

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.otpService.sendOtp(email, {
      hashedPassword,
    });

    return { message: "OTP sent to your email" };
  }

  async verifyOtpAndSignUp(dto: VerifyOtpDto, meta: RequestMeta) {
    const { email, otp } = dto;
    const pendingOTP = await this.otpService.verifyOtp(email, otp);

    const tempUserName = this.createTempUserName();

    const { insertedUser, insertedSession } = await this.db.transaction(
      async (tx) => {
        const existingUser = await tx.query.users.findFirst({
          where: eq(users.email, email),
          columns: { id: true },
        });

        if (existingUser)
          throw new ConflictException("User with this email already exists");

        const [insertedUser] = await tx
          .insert(schema.users)
          .values({
            email,
            userName: tempUserName,
            hashedPassword: pendingOTP.hashedPassword,
            isVerified: true,
          })
          .returning(USER_SELECT_FIELDS);

        const [insertedSession] = await tx
          .insert(schema.sessions)
          .values({
            userId: insertedUser.id,
            expiresAt: new Date(Date.now() + SESSION_EXPIRE_TIME), // 7 days
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
          })
          .returning();

        return { insertedUser, insertedSession };
      },
    );

    // delete otp and send welcome email
    await Promise.all([
      this.otpService.deleteOtp(pendingOTP.id),
      this.mailService.sendWelcomeEmail(email, tempUserName),
    ]);

    const sessionToken = this.generateSessionToken({
      sub: insertedUser.id,
      sid: insertedSession.id,
    });

    return { sessionToken, userData: insertedUser };
  }

  async signIn(dto: SignInDto, meta: RequestMeta) {
    const { email, password } = dto;
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) throw new NotFoundException("User account not found");

    if (!user.hashedPassword) {
      throw new UnauthorizedException(
        "This account uses social login. Please sign in with Google.",
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) throw new UnauthorizedException("Invalid password");
    if (!user.isVerified)
      throw new UnauthorizedException("Account is not verified.");

    const sessionToken = await this.issueSessionToken(user.id, meta);
    const userData = this.getUserData(user);

    return { sessionToken, userData };
  }

  async forgotPassword(email: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) throw new NotFoundException("User not found");

    const resetToken = this.generatePasswordResetToken(email);
    const clientUrl =
      this.configService.get<string>("clientUrl") || "http://localhost:3000";
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    await this.mailService.sendResetPasswordEmail(email, resetLink);
    return "Password reset link sent to your email";
  }

  async verifyOtpForPasswordReset(email: string, code: string) {
    const pendingOTP = await this.otpService.verifyOtp(email, code);

    const resetToken = this.generatePasswordResetToken(email);
    await this.otpService.deleteOtp(pendingOTP.id);
    return resetToken;
  }

  async resetPassword(resetToken: string, newPassword: string) {
    const decoded = jwt.verify(
      resetToken,
      this.tokenSecret,
    ) as PasswordResetTokenPayload;

    if (decoded.purpose !== "password-reset" || !decoded.email) {
      throw new UnauthorizedException("Invalid token type");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.db
      .update(users)
      .set({ hashedPassword })
      .where(eq(users.email, decoded.email));
  }

  async resetPassWithOldPass(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) throw new NotFoundException("User not found");

    if (!user.hashedPassword) {
      throw new UnauthorizedException(
        "This account uses social login. Use Google to manage your account.",
      );
    }

    const isValid = await bcrypt.compare(oldPassword, user.hashedPassword);

    if (!isValid) throw new UnauthorizedException("Old password incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.db
      .update(users)
      .set({ hashedPassword })
      .where(eq(users.id, userId));
  }

  async revokeSession(sessionId: string) {
    await this.db
      .update(schema.sessions)
      .set({ isRevoked: true })
      .where(eq(schema.sessions.id, sessionId));
  }

  async googleAuthCallback(googleUser: GoogleAuthUser, meta: RequestMeta) {
    if (!googleUser?.email || !googleUser.googleId) {
      throw new UnauthorizedException("Invalid Google account payload");
    }

    const { email, firstName, lastName, picture, googleId } = googleUser;

    let user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user) {
      const needsGoogleId = !user.googleId;
      const needsFullName = !user.fullName && firstName && lastName;
      const needsAvatar = !user.avatarImage && picture;

      if (needsGoogleId || needsFullName || needsAvatar) {
        const updatePayload: Partial<typeof schema.users.$inferInsert> = {};
        if (needsGoogleId) {
          updatePayload.googleId = googleId;
          updatePayload.isVerified = true;
        }
        if (needsFullName)
          updatePayload.fullName = `${firstName} ${lastName}`.trim();
        if (needsAvatar) updatePayload.avatarImage = picture;

        const [updatedUserId] = await this.db
          .update(users)
          .set(updatePayload)
          .where(eq(users.id, user.id))
          .returning({ id: users.id });

        const updatedUser = await this.db.query.users.findFirst({
          where: eq(users.id, updatedUserId.id),
        });
        user = updatedUser!;
      }
    } else {
      const tempUserName = this.createTempUserName();

      const [insertedUser] = await this.db
        .insert(users)
        .values({
          email,
          userName: tempUserName,
          fullName: `${firstName} ${lastName}`.trim(),
          avatarImage: picture,
          googleId,
          isVerified: true,
        })
        .returning();

      user = insertedUser;
      await this.mailService.sendWelcomeEmail(email, tempUserName);
    }

    const sessionToken = await this.issueSessionToken(user.id, meta);
    const userData = this.getUserData(user);

    return { sessionToken, userData };
  }
}
