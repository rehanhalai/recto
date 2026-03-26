"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";

import { Button, Input, Label } from "@/components/ui";
import { setNewPassword } from "@/features/auth/services/auth-api";
import {
  newPasswordSchema,
  type NewPasswordInput,
} from "@/features/auth/validation/schemas";
import { AuthLayout } from "@/features/auth/pages/AuthLayout";
import { toast } from "@/lib/toast";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: NewPasswordInput) => {
    if (!token) {
      setGlobalError("Reset link is missing or invalid.");
      return;
    }

    setGlobalError(null);

    try {
      await setNewPassword({ resetToken: token, password: values.password });
      setDone(true);
      toast.success("Password updated successfully.");
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        "Could not reset password. Please request a new link.",
      );
      setGlobalError(message);
      toast.error(message);
    }
  };

  return (
    <AuthLayout
      title={done ? "Password updated." : "Create new password."}
      topSlot={
        <p className="mb-4 text-center text-sm leading-6 text-[#6f6154] dark:text-[#a1907b]">
          {done
            ? "Your account is secure again. You can now sign in with your new password."
            : "Choose a strong password you have not used before."}
        </p>
      }
      footerSlot={
        <p className="mt-6 text-center text-xs text-[#7b6f64] dark:text-[#9b8b79]">
          <Link href="/login" className="text-[#8a6b37] hover:underline">
            Back to login
          </Link>
        </p>
      }
    >
      {done ? (
        <Button
          type="button"
          onClick={() => router.push("/login")}
          className="h-11 w-full rounded-lg bg-[#1f1a16] text-[15px] font-medium text-[#faf5eb] transition hover:opacity-90 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
        >
          Continue to login
        </Button>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!token && (
            <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
              <p className="text-sm text-red-700 dark:text-red-300">
                This link is invalid. Request a new reset link.
              </p>
            </div>
          )}

          {globalError && (
            <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
              <p className="text-sm text-red-700 dark:text-red-300">
                {globalError}
              </p>
            </div>
          )}

          <div>
            <Label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]"
            >
              New password
            </Label>
            <div className="relative mt-2">
              <LockIcon
                size={18}
                className="absolute left-3 top-3 text-[#9a8d80] dark:text-[#8f7f6b]"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                className="h-11 rounded-lg border-[#dfd2c1] bg-[#f6efe5] pl-10 pr-10 text-[#211b16] placeholder:text-[#958779] focus-visible:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3 text-[#9a8d80] transition-colors hover:text-[#211b16] dark:text-[#8f7f6b] dark:hover:text-[#f4eee5]"
              >
                {showPassword ? (
                  <EyeSlashIcon size={18} />
                ) : (
                  <EyeIcon size={18} />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]"
            >
              Confirm password
            </Label>
            <div className="relative mt-2">
              <LockIcon
                size={18}
                className="absolute left-3 top-3 text-[#9a8d80] dark:text-[#8f7f6b]"
              />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat new password"
                className="h-11 rounded-lg border-[#dfd2c1] bg-[#f6efe5] pl-10 pr-10 text-[#211b16] placeholder:text-[#958779] focus-visible:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
                {...form.register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-3 text-[#9a8d80] transition-colors hover:text-[#211b16] dark:text-[#8f7f6b] dark:hover:text-[#f4eee5]"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon size={18} />
                ) : (
                  <EyeIcon size={18} />
                )}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !token}
            className="h-11 w-full rounded-lg bg-[#1f1a16] text-[15px] font-medium text-[#faf5eb] transition hover:opacity-90 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
          >
            {form.formState.isSubmitting && (
              <SpinnerIcon size={18} className="mr-2 animate-spin" />
            )}
            {form.formState.isSubmitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
