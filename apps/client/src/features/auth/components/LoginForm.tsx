"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import {
  LockIcon,
  EnvelopeIcon,
  SpinnerIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react";

import { Button, Input, Label } from "@/components/ui";
import { useLogin } from "../hooks/use-login";
import { SocialAuth } from "./SocialAuth";
import { loginSchema, type LoginInput } from "../validation/schemas";

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

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setGlobalError(null);
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      toast.success("Login successful!");
      router.push("/feed");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        "Login failed. Please try again.",
      );
      setGlobalError(errorMessage);
      toast.error(errorMessage);
      console.error("Login error:", error);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#8a6b37] transition-colors hover:opacity-80"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-2">
            <LockIcon
              size={18}
              className="absolute left-3 top-3 text-[#9a8d80] dark:text-[#8f7f6b]"
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-11 rounded-lg border-[#dfd2c1] bg-[#f6efe5] pl-10 pr-10 text-[#211b16] placeholder:text-[#958779] focus-visible:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-2 h-11 w-full rounded-lg bg-[#1f1a16] text-[15px] font-medium text-[#faf5eb] transition hover:opacity-90 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
          size="lg"
        >
          {loginMutation.isPending && (
            <SpinnerIcon size={18} className="mr-2 animate-spin" />
          )}
          {loginMutation.isPending ? "Signing in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-2 text-sm leading-6 text-[#6f6154] dark:text-[#a1907b]">
        {
          <>
            <span>New to Recto? </span>
            <Link
              href="/signup"
              className="font-medium text-[#8a6b37] hover:underline"
            >
              Create an account
            </Link>
          </>
        }
      </p>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[#9a8d80] dark:text-[#8f7f6b]">
        <span className="h-px flex-1 bg-[#dfd2c1] dark:bg-[#352d24]" />
        <span>or continue with Google</span>
        <span className="h-px flex-1 bg-[#dfd2c1] dark:bg-[#352d24]" />
      </div>

      <SocialAuth actionText="Continue with Google" />

      {globalError && (
        <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-300">
            {globalError}
          </p>
        </div>
      )}
    </div>
  );
}
