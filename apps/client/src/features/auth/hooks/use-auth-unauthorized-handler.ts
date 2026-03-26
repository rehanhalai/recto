"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth-store";

export const useAuthUnauthorizedHandler = () => {
  const queryClient = useQueryClient();
  const resetAuth = useAuthStore((state) => state.reset);

  useEffect(() => {
    const handleUnauthorized = () => {
      resetAuth();
      queryClient.clear();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [queryClient, resetAuth]);
};
