"use client";

import { useAuthStore } from "../store/auth-store";
import { useAuthUnauthorizedHandler } from "./use-auth-unauthorized-handler";
import { useCurrentUser } from "./use-current-user";
import { useSignup } from "./use-signup";
import { useVerifyOTP } from "./use-verify-otp";
import { useLogin } from "./use-login";
import { useLogout } from "./use-logout";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { isCheckingAuth } = useCurrentUser();
  const signupMutation = useSignup();
  const verifyOTPMutation = useVerifyOTP();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  useAuthUnauthorizedHandler();

  return {
    user,
    isAuthenticated,
    isCheckingAuth,

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
