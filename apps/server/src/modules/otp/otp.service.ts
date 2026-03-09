import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../../../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../../db/schema';
import { otps } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OtpService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly mailService: MailService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string, metadata: { hashedPassword?: string } = {}) {
    const code = this.generateCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing OTP for this email if any
    await this.db.delete(otps).where(eq(otps.email, email));

    await this.db.insert(otps).values({
      email,
      hashedCode,
      hashedPassword: metadata.hashedPassword,
      expiresAt,
    });

    await this.mailService.sendOtpEmail(email, code);
  }

  async verifyOtp(email: string, code: string) {
    const otpRecord = await this.db.query.otps.findFirst({
      where: eq(otps.email, email),
    });

    if (!otpRecord) throw new NotFoundException('OTP not found or expired');

    if (new Date() > otpRecord.expiresAt) {
      await this.db.delete(otps).where(eq(otps.id, otpRecord.id));
      throw new NotFoundException('OTP expired');
    }

    const isValid = await bcrypt.compare(code, otpRecord.hashedCode);
    if (!isValid) throw new NotFoundException('Invalid OTP code');

    return otpRecord;
  }

  async deleteOtp(id: string) {
    await this.db.delete(otps).where(eq(otps.id, id));
  }
}
