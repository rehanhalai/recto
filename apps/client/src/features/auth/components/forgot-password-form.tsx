"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { usePasswordReset } from "../hooks/use-password-reset";

export const ForgotPasswordForm: React.FC = () => {
  const {
    step,
    email,
    isLoading,
    error,
    requestPasswordReset,
    clearError,
    reset,
  } = usePasswordReset();

  const [value, setValue] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearError();

    try {
      await requestPasswordReset(value);
    } catch (submitError) {
      console.error("Failed to send reset link:", submitError);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-[#dfd2c1] bg-[#f7f1e8] p-6 dark:border-[#352d24] dark:bg-[#1f1913]">
      <h2 className="font-serif text-3xl text-[#1f1a16] dark:text-[#f4eee4]">
        Reset password
      </h2>

      <p className="mt-2 text-sm text-[#6f6154] dark:text-[#a1907b]">
        {step === "request"
          ? "Enter your email and we will send a reset link."
          : "Check your inbox for your reset link."}
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {step === "request" ? (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]">
              Email
            </label>
            <input
              type="email"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              required
              disabled={isLoading}
              placeholder="you@example.com"
              className="h-11 w-full rounded-lg border border-[#dfd2c1] bg-[#f6efe5] px-3 text-[#211b16] placeholder:text-[#958779] focus:outline-none focus:ring-2 focus:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-lg bg-[#1f1a16] text-sm font-medium text-[#faf5eb] transition hover:opacity-90 disabled:opacity-60 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      ) : (
        <div className="mt-5 space-y-4">
          <p className="rounded-lg border border-[#dfd2c1] bg-[#f6efe5] px-4 py-3 text-sm text-[#6f6154] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#a1907b]">
            Reset link sent to <strong>{email}</strong>
          </p>

          <button
            type="button"
            onClick={() => {
              reset();
              setValue("");
            }}
            className="h-10 w-full rounded-lg text-sm font-medium text-[#8a6b37] transition hover:bg-[#f0e5d7] dark:hover:bg-[#251e17]"
          >
            Send again
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-[#7b6f64] dark:text-[#9b8b79]">
        <Link href="/login" className="text-[#8a6b37] hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
};
