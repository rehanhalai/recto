"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { useAuthStore } from "../store/auth-store";
import * as authApi from "../services/auth-api";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resetAuth = useAuthStore((state) => state.reset);

  return useMutation({
    mutationFn: () => authApi.logoutRequest(),
    onSuccess: () => {
      resetAuth();
      queryClient.clear();
      router.push("/login");
      toast.success("Logged out successfully");
    },
    onError: (error: unknown) => {
      console.error("Logout failed", error);
      resetAuth();
      queryClient.clear();
      router.push("/login");
    },
  });
};
