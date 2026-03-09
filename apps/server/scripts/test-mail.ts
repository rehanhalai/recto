import { NestFactory } from '@nestjs/core';
import { MailModule } from '../src/modules/mail/mail.module';
import { MailService } from '../src/modules/mail/mail.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../src/config/config';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MailModule);
  const mailService = app.get(MailService);

  const testEmail = 'halairehan01@gmail.com';

  console.log(`Sending test emails to ${testEmail}...`);

  try {
    // 1. Send OTP Email
    console.log('Sending OTP email...');
    await mailService.sendOtpEmail(testEmail, '123456');

    // 2. Send Welcome Email
    console.log('Sending Welcome email...');
    await mailService.sendWelcomeEmail(testEmail, 'Rehan');

    // 3. Send Password Reset Email
    console.log('Sending Password Reset email...');
    await mailService.sendResetPasswordEmail(
      testEmail,
      'http://localhost:3000/reset-password?token=test-token',
    );

    console.log('All test emails sent successfully!');
  } catch (error) {
    console.error('Error sending test emails:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
