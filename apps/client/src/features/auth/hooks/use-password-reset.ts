"use client";
/**
 * usePasswordReset Hook
 * Hook for password reset flow (forgot password)
 */

import { useState, useCallback } from "react";
import * as authApi from "../services/auth-api";
import {
  ForgotPasswordRequest,
  PasswordResetOTPVerification,
  NewPasswordRequest,
} from "../types";

interface PasswordResetState {
  step: "request" | "verify" | "reset" | "complete";
  email: string | null;
  resetToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export const usePasswordReset = () => {
  const [state, setState] = useState<PasswordResetState>({
    step: "request",
    email: null,
    resetToken: null,
    isLoading: false,
    error: null,
  });

  /**
   * Step 1: Request password reset OTP
   */
  const requestPasswordReset = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authApi.forgotPasswordRequest({ email });
      setState((prev) => ({
        ...prev,
        step: "verify",
        email,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to send reset code";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * Step 2: Verify OTP
   */
  const verifyResetOTP = useCallback(
    async (code: string) => {
      if (!state.email) {
        throw new Error("Email is required");
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await authApi.verifyPasswordResetOTP({
          email: state.email,
          code,
        });

        setState((prev) => ({
          ...prev,
          step: "reset",
          resetToken: response.data.resetToken,
          isLoading: false,
        }));
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || error?.message || "Invalid or expired code";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw error;
      }
    },
    [state.email],
  );

  /**
   * Step 3: Set new password
   */
  const setNewPassword = useCallback(
    async (password: string) => {
      if (!state.resetToken) {
        throw new Error("Reset token is required");
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await authApi.setNewPassword({
          resetToken: state.resetToken,
          password,
        });

        setState((prev) => ({
          ...prev,
          step: "complete",
          isLoading: false,
        }));
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || error?.message || "Failed to reset password";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw error;
      }
    },
    [state.resetToken],
  );

  /**
   * Reset the flow
   */
  const reset = useCallback(() => {
    setState({
      step: "request",
      email: null,
      resetToken: null,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    requestPasswordReset,
    verifyResetOTP,
    setNewPassword,
    reset,
    clearError,
  };
};
