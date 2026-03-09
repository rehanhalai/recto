"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "../store/auth-store";
import * as authApi from "../services/auth-api";
import { LoginCredentials, SignupCredentials, OTPVerification } from "../types";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const resetAuth = useAuthStore((state) => state.reset);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // --- Queries ---

  // Check current user session on mount / init
  // Only check if we are NOT authenticated locally.
  // If we are authenticated locally, we trust that state until a 401 occurs.
  const currentUserQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data;
    },
    enabled: !isAuthenticated, // Optimization: Trust local persistence
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  // Sync query data to store when successful
  if (currentUserQuery.isSuccess && currentUserQuery.data && !user) {
    setUser(currentUserQuery.data);
  } else if (currentUserQuery.isError && isAuthenticated) {
    // If we tried to fetch and failed (e.g. 401), clear local state
    resetAuth();
  }

  // Handle global 401 unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      resetAuth();
      queryClient.clear();
      router.push("/login");
      // Optional: toast.error("Session expired. Please login again.");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [resetAuth, queryClient, router]);

  // --- Mutations ---

  const signupMutation = useMutation({
    mutationFn: (credentials: SignupCredentials) =>
      authApi.signupRequest(credentials),
    onError: (error: any) => {
      // Error handling is usually done in the component, but can be global here too
      console.error("Signup failed", error);
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (data: OTPVerification) => authApi.verifySignupOTP(data),
    onSuccess: (data) => {
      setUser(data.data.user);
    },
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authApi.loginRequest(credentials),
    onSuccess: (data) => {
      setUser(data.data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logoutRequest(),
    onSuccess: () => {
      resetAuth();
      queryClient.clear(); // Clear all cache
      router.push("/login");
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      console.error("Logout failed", error);
      // Force logout anyway
      resetAuth();
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    // User State
    user,
    isAuthenticated,
    isCheckingAuth: currentUserQuery.isLoading,

    // Actions (Mutations)
    signup: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    signupError: signupMutation.error,

    verifyOTP: verifyOTPMutation.mutateAsync,
    isVerifyingOTP: verifyOTPMutation.isPending,
    verifyOTPError: verifyOTPMutation.error,

    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
};
