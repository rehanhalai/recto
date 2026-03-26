"use client";
/**
 * usePasswordReset Hook
 * Hook for password reset flow (forgot password)
 */

import { useState, useCallback } from "react";
import * as authApi from "../services/auth-api";

interface PasswordResetState {
  step: "request" | "complete";
  email: string | null;
  isLoading: boolean;
  error: string | null;
}

export const usePasswordReset = () => {
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

  const [state, setState] = useState<PasswordResetState>({
    step: "request",
    email: null,
    isLoading: false,
    error: null,
  });

  /**
   * Step 1: Request password reset link
   */
  const requestPasswordReset = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authApi.forgotPasswordRequest({ email });
      setState((prev) => ({
        ...prev,
        step: "complete",
        email,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to send reset code");
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * Set new password from reset link token
   */
  const setNewPassword = useCallback(
    async (password: string, resetToken: string) => {
      if (!resetToken) {
        throw new Error("Reset token is required");
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await authApi.setNewPassword({
          resetToken,
          password,
        });

        setState((prev) => ({
          ...prev,
          step: "complete",
          isLoading: false,
        }));
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, "Failed to reset password");
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw error;
      }
    },
    [],
  );

  /**
   * Reset the flow
   */
  const reset = useCallback(() => {
    setState({
      step: "request",
      email: null,
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
    setNewPassword,
    reset,
    clearError,
  };
};
