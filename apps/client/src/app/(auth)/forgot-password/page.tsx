"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnvelopeIcon, SpinnerIcon } from "@phosphor-icons/react";

import { Button, Input, Label } from "@/components/ui";
import { forgotPasswordRequest } from "@/features/auth/services/auth-api";
import {
  passwordResetSchema,
  type PasswordResetInput,
} from "@/features/auth/validation/schemas";
import { AuthLayout } from "@/features/auth/pages/AuthLayout";
import { toast } from "@/lib/toast";

type Step = "request" | "sent";

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

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: PasswordResetInput) => {
    setGlobalError(null);

    try {
      await forgotPasswordRequest({ email: values.email });
      setEmail(values.email);
      setStep("sent");
      toast.success("Reset link sent successfully.");
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        "Could not send reset link right now.",
      );
      setGlobalError(message);
      toast.error(message);
    }
  };

  return (
    <AuthLayout
      title={step === "request" ? "Reset password." : "Check your inbox."}
      topSlot={
        <p className="mb-4 text-center text-sm leading-6 text-[#6f6154] dark:text-[#a1907b]">
          {step === "request"
            ? "Enter your account email and we will send a secure reset link."
            : "We sent a password reset link. Open it on this device to continue."}
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
      {step === "request" ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {globalError && (
            <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
              <p className="text-sm text-red-700 dark:text-red-300">
                {globalError}
              </p>
            </div>
          )}

          <div>
            <Label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]"
            >
              Email
            </Label>
            <div className="relative mt-2">
              <EnvelopeIcon
                size={18}
                className="absolute left-3 top-3 text-[#9a8d80] dark:text-[#8f7f6b]"
              />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-lg border-[#dfd2c1] bg-[#f6efe5] pl-10 text-[#211b16] placeholder:text-[#958779] focus-visible:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-11 w-full rounded-lg bg-[#1f1a16] text-[15px] font-medium text-[#faf5eb] transition hover:opacity-90 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
          >
            {form.formState.isSubmitting && (
              <SpinnerIcon size={18} className="mr-2 animate-spin" />
            )}
            {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="rounded-lg border border-[#dfd2c1] bg-[#f6efe5] p-4 text-sm text-[#66584c] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#a1907b]">
            Reset instructions were sent to
            <span className="ml-1 font-semibold text-[#1f1a16] dark:text-[#f4eee5]">
              {email}
            </span>
            . The link expires after a short time for security.
          </div>

          <div className="rounded-lg border border-[#dfd2c1] bg-[#f9f3ea] p-4 text-sm text-[#6f6154] dark:border-[#352d24] dark:bg-[#1f1913] dark:text-[#a1907b]">
            If you do not see the message, check spam or promotions folders,
            then retry from this page.
          </div>

          <Button
            type="button"
            onClick={() => {
              setStep("request");
              setGlobalError(null);
            }}
            variant="ghost"
            className="h-10 w-full text-[#8a6b37] hover:bg-[#f0e5d7] hover:text-[#71572f] dark:hover:bg-[#251e17]"
          >
            Send again
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
