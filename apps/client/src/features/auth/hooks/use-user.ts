"use client";
/**
 * useUser Hook
 * Hook for user profile operations
 */

import { useState, useCallback } from "react";
import { useAuthStore } from "../store/auth-store";
import { ProfileUpdate } from "../types";
import * as authApi from "../services/auth-api";

export const useUser = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (data: ProfileUpdate) => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await authApi.updateProfile(data);
        setUser(response.data);
        return response.data;
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || error?.message || "Failed to update profile";
        setError(errorMessage);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [setUser],
  );

  /**
   * Check username availability
   */
  const checkUsernameAvailability = useCallback(async (userName: string) => {
    try {
      const response = await authApi.checkUsernameAvailability(userName);
      return response.data.isAvailable;
    } catch (error: any) {
      console.error("Failed to check username availability:", error);
      return false;
    }
  }, []);

  /**
   * Change password
   */
  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      setIsUpdating(true);
      setError(null);

      try {
        await authApi.changePassword({ oldPassword, newPassword });
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || error?.message || "Failed to change password";
        setError(errorMessage);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isUpdating,
    error,
    updateProfile,
    checkUsernameAvailability,
    changePassword,
    clearError,
  };
};
