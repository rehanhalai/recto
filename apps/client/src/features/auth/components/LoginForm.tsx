"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// Validation Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginInput = z.infer<typeof loginSchema>;

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
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Login failed. Please try again.";
      setGlobalError(errorMessage);
      toast.error(errorMessage);
      console.error("Login error:", error);
    }
  };

  return (
    <>
      {/* Error Alert */}
      {globalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{globalError}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div>
          <Label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email address
          </Label>
          <div className="relative mt-2">
            <EnvelopeIcon
              size={18}
              className="absolute left-3 top-3 text-muted-foreground"
            />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              {...form.register("email")}
            />
          </div>
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-red-600">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-black hover:text-black transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-2">
            <LockIcon
              size={18}
              className="absolute left-3 top-3 text-muted-foreground"
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon size={18} />
              ) : (
                <EyeIcon size={18} />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Sign In Button */}
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full mt-6 bg-black hover:bg-gray-900 text-white font-medium py-2.5"
          size="lg"
        >
          {loginMutation.isPending && (
            <SpinnerIcon size={18} className="mr-2 animate-spin" />
          )}
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <SocialAuth actionText="Sign in with Google" />
    </>
  );
}
