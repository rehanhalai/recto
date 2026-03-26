"use client";

import { useMutation } from "@tanstack/react-query";
import * as authApi from "../services/auth-api";
import { SignupCredentials } from "../types";

export const useSignup = () => {
  return useMutation({
    mutationFn: (credentials: SignupCredentials) =>
      authApi.signupRequest(credentials),
    onError: (error: unknown) => {
      console.error("Signup failed", error);
    },
  });
};
