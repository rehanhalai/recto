/**
 * Forgot Password Form
 * Multi-step password reset flow with OTP verification
 */

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { usePasswordReset } from "../hooks/use-password-reset";
import Link from "next/link";

type ForgotPasswordStep = "email" | "otp" | "password" | "complete";

export const ForgotPasswordForm: React.FC = () => {
  const router = useRouter();
  const {
    step,
    email,
    isLoading,
    error,
    requestPasswordReset,
    verifyResetOTP,
    setNewPassword,
    clearError,
  } = usePasswordReset();

  const [formData, setFormData] = useState({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });

  // Step 1: Request password reset
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await requestPasswordReset(formData.email);
    } catch (error) {
      console.error("Failed to send reset code:", error);
    }
  };

  // Step 2: Verify OTP
  const handleOTPSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.code.length !== 6) {
      alert("Code must be 6 digits");
      return;
    }

    try {
      await verifyResetOTP(formData.code);
    } catch (error) {
      console.error("Failed to verify code:", error);
    }
  };

  // Step 3: Set new password
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    try {
      await setNewPassword(formData.password);
    } catch (error) {
      console.error("Failed to set new password:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "code") {
      // Only allow digits
      setFormData((prev) => ({
        ...prev,
        code: value.replace(/[^0-9]/g, "").slice(0, 6),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          {step === "request" && "Enter your email address"}
          {step === "verify" && "Enter the code we sent to your email"}
          {step === "reset" && "Set your new password"}
          {step === "complete" && "Password reset successful"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Email */}
        {step === "request" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "verify" && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
              We&apos;ve sent a 6-digit code to <strong>{email}</strong>
            </div>

            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                maxLength={6}
                value={formData.code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || formData.code.length !== 6}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, email: "" }))}
              className="w-full text-gray-600 hover:text-gray-800 text-sm"
            >
              Use different email
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === "reset" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                At least 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === "complete" && (
          <div className="space-y-4 text-center">
            <div className="text-5xl mb-4">✓</div>
            <p className="text-gray-600">Your password has been reset!</p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Footer */}
        {step !== "complete" && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
