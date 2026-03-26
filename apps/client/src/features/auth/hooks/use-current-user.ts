"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth-store";
import * as authApi from "../services/auth-api";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

export const useCurrentUser = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const resetAuth = useAuthStore((state) => state.reset);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const currentUserQuery = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data;
    },
    enabled: !isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (currentUserQuery.isSuccess && currentUserQuery.data && !user) {
      setUser(currentUserQuery.data);
      return;
    }

    if (currentUserQuery.isError && isAuthenticated) {
      resetAuth();
    }
  }, [
    currentUserQuery.isSuccess,
    currentUserQuery.data,
    currentUserQuery.isError,
    isAuthenticated,
    user,
    setUser,
    resetAuth,
  ]);

  return {
    currentUserQuery,
    isCheckingAuth: currentUserQuery.isLoading,
  };
};
