"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EnvelopeIcon,
  LockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SpinnerIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";

import { usePasswordReset } from "@/features/auth";
import {
  passwordResetSchema,
  passwordResetOTPSchema,
  newPasswordSchema,
  type PasswordResetInput,
  type PasswordResetOTPInput,
  type NewPasswordInput,
} from "@/features/auth/validation/schemas";

type ResetStep = "email" | "otp" | "password" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    requestPasswordReset,
    verifyResetOTP,
    setNewPassword,
    isLoading,
    error: authError,
  } = usePasswordReset();
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Step 1: Email Form
  const emailForm = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
  });

  // Step 2: OTP Form
  const otpForm = useForm<PasswordResetOTPInput>({
    resolver: zodResolver(passwordResetOTPSchema),
  });

  // Step 3: New Password Form
  const passwordForm = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
  });

  const handleEmailSubmit = async (data: PasswordResetInput) => {
    setLocalError(null);
    try {
      setEmail(data.email);
      await requestPasswordReset(data.email);
      setStep("otp");
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Failed to send reset code.",
      );
    }
  };

  const handleOTPSubmit = async (data: PasswordResetOTPInput) => {
    setLocalError(null);
    try {
      await verifyResetOTP(data.otp);
      setStep("password");
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Invalid code. Please try again.",
      );
    }
  };

  const handlePasswordSubmit = async (data: NewPasswordInput) => {
    setLocalError(null);
    try {
      await setNewPassword(data.password);
      setStep("success");
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Failed to reset password.",
      );
    }
  };

  const displayError = localError || authError;
  const isEmailSubmitting = emailForm.formState.isSubmitting || isLoading;
  const isOTPSubmitting = otpForm.formState.isSubmitting || isLoading;
  const isPasswordSubmitting = passwordForm.formState.isSubmitting || isLoading;

  return (
    <div className="w-full space-y-8">
      {/* Step 1: Email */}
      {step === "email" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reset Password
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a code to reset your
              password
            </p>
          </div>

          {displayError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                {displayError}
              </p>
            </div>
          )}

          <form
            onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon
                  weight="regular"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <input
                  {...emailForm.register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                  disabled={isEmailSubmitting}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isEmailSubmitting}
              className="w-full h-11 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isEmailSubmitting ? (
                <>
                  <SpinnerIcon
                    weight="bold"
                    size={18}
                    className="animate-spin"
                  />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Code
                  <ArrowRightIcon weight="bold" size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 dark:text-gray-400">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}

      {/* Step 2: OTP */}
      {step === "otp" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Verify Your Email
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {email}
              </span>
            </p>
          </div>

          {displayError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                {displayError}
              </p>
            </div>
          )}

          <form
            onSubmit={otpForm.handleSubmit(handleOTPSubmit)}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Enter Code
              </label>
              <input
                {...otpForm.register("otp")}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-3 text-2xl tracking-widest text-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all font-mono"
                disabled={isOTPSubmitting}
              />
              {otpForm.formState.errors.otp && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isOTPSubmitting}
              className="w-full h-11 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isOTPSubmitting ? (
                <>
                  <SpinnerIcon
                    weight="bold"
                    size={18}
                    className="animate-spin"
                  />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Code
                  <ArrowRightIcon weight="bold" size={18} />
                </>
              )}
            </button>
          </form>

          <button
            onClick={() => setStep("email")}
            className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon weight="bold" size={16} />
            Back to Email
          </button>
        </div>
      )}

      {/* Step 3: New Password */}
      {step === "password" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Password
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter a new password to reset your account
            </p>
          </div>

          {displayError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                {displayError}
              </p>
            </div>
          )}

          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <LockIcon
                  weight="regular"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <input
                  {...passwordForm.register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                  disabled={isPasswordSubmitting}
                />
              </div>
              {passwordForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <LockIcon
                  weight="regular"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <input
                  {...passwordForm.register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                  disabled={isPasswordSubmitting}
                />
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPasswordSubmitting}
              className="w-full h-11 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isPasswordSubmitting ? (
                <>
                  <SpinnerIcon
                    weight="bold"
                    size={18}
                    className="animate-spin"
                  />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRightIcon weight="bold" size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Step 4: Success */}
      {step === "success" && (
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <CheckCircleIcon
              weight="fill"
              size={80}
              className="text-green-500"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Password Reset!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your password has been successfully reset. You can now sign in
              with your new password.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center h-11 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors gap-2"
          >
            Sign In
            <ArrowRightIcon weight="bold" size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
