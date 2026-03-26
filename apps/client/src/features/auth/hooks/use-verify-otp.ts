"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth-store";
import * as authApi from "../services/auth-api";
import { OTPVerification } from "../types";

export const useVerifyOTP = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: OTPVerification) => authApi.verifySignupOTP(data),
    onSuccess: (data) => {
      setUser(data.data.user);
    },
  });
};
