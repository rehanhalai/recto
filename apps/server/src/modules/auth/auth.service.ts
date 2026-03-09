import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../../db/schema';
import { users } from '../../../db/schema';
import { SignUpDto, VerifyOtpDto, SignInDto } from './dto/auth.dto';
import { USER_SELECT_FIELDS } from '../../constants';
import { OtpService } from '../otp/otp.service';
import { MailService } from '../mail/mail.service';

export interface JwtPayload {
  _id: string;
  email?: string;
  purpose?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  private generateToken(payload: object) {
    const secret = this.configService.get<string>('refreshToken.secret')!;
    const expire = this.configService.get<string>('refreshToken.expire')!;
    return jwt.sign(payload, secret, { expiresIn: expire as any });
  }

  async signUp(dto: SignUpDto) {
    const { email, password } = dto;
    const existingEmail = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingEmail) {
      if (existingEmail.isVerified) {
        throw new ConflictException(
          'User with this email already exists and is verified',
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.otpService.sendOtp(email, {
      hashedPassword,
    });

    return { message: 'OTP sent to your email' };
  }

  async verifyOtpAndSignUp(dto: VerifyOtpDto) {
    const { email, otp } = dto;
    const pendingOTP = await this.otpService.verifyOtp(email, otp);

    const tempUserName =
      'user_' + crypto.randomUUID().replace(/-/g, '').slice(0, 10);

    const [insertedUser] = await this.db
      .insert(users)
      .values({
        email,
        userName: tempUserName,
        hashedPassword: pendingOTP.hashedPassword,
        isVerified: true,
      })
      .returning(USER_SELECT_FIELDS);

    await this.otpService.deleteOtp(pendingOTP.id);

    // Send welcome email
    await this.mailService.sendWelcomeEmail(email, tempUserName);

    const token = this.generateToken({ _id: insertedUser.id });
    const { id, ...userData } = insertedUser;
    return { token, userData };
  }

  async signIn(dto: SignInDto) {
    const { email, password } = dto;
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) throw new NotFoundException('User account not found');

    if (!user.hashedPassword) {
      throw new UnauthorizedException(
        'This account uses social login. Please sign in with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');
    if (!user.isVerified)
      throw new UnauthorizedException('Account is not verified.');

    const token = this.generateToken({ _id: user.id });
    const userData = {
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
      avatarImage: user.avatarImage,
      coverImage: user.coverImage,
      role: user.role,
      isVerified: user.isVerified,
    };
    return { token, userData };
  }

  async forgotPassword(email: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) throw new NotFoundException('User not found');

    const resetToken = this.generateToken({ email, purpose: 'password-reset' });
    const clientUrl =
      this.configService.get<string>('clientUrl') || 'http://localhost:3000';
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    await this.mailService.sendResetPasswordEmail(email, resetLink);
    return 'Password reset link sent to your email';
  }

  async verifyOtpForPasswordReset(email: string, code: string) {
    const pendingOTP = await this.otpService.verifyOtp(email, code);

    const resetToken = this.generateToken({ email, purpose: 'password-reset' });
    await this.otpService.deleteOtp(pendingOTP.id);
    return resetToken;
  }

  async resetPassword(resetToken: string, newPassword: string) {
    const secret = this.configService.get<string>('refreshToken.secret')!;
    const decoded = jwt.verify(resetToken, secret) as JwtPayload;

    if (decoded.purpose !== 'password-reset' || !decoded.email) {
      throw new UnauthorizedException('Invalid token type');
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
    if (!user) throw new NotFoundException('User not found');

    if (!user.hashedPassword) {
      throw new UnauthorizedException(
        'This account uses social login. Use Google to manage your account.',
      );
    }

    const isValid = await bcrypt.compare(oldPassword, user.hashedPassword);

    if (!isValid) throw new UnauthorizedException('Old password incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.db
      .update(users)
      .set({ hashedPassword })
      .where(eq(users.id, userId));
  }

  async googleAuthCallback(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }

    const { email, firstName, lastName, picture, googleId } = req.user;

    let user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user) {
      const needsGoogleId = !user.googleId;
      const needsFullName = !user.fullName && firstName && lastName;
      const needsAvatar = !user.avatarImage && picture;

      if (needsGoogleId || needsFullName || needsAvatar) {
        const updatePayload: any = {};
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
      const tempUserName =
        'user_' + crypto.randomUUID().replace(/-/g, '').slice(0, 10);

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

    const token = this.generateToken({ _id: user.id });
    const userData = {
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };
    return { token, userData };
  }
}
