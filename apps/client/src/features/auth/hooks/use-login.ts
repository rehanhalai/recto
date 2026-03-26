"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth-store";
import * as authApi from "../services/auth-api";
import { LoginCredentials } from "../types";

export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authApi.loginRequest(credentials),
    onSuccess: (data) => {
      setUser(data.data.user);
    },
  });
};
