import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 characters long' })
  otp: string;
}

export class SignUpDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

export class SignInDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;
}

export class NewPasswordDto {
  @IsString()
  resetToken: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8, { message: 'Old password must be at least 8 characters long' })
  oldPassword: string;

  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword: string;
}
