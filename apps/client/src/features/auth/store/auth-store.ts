/**
 * Zustand Auth Store
 * Global authentication state management (Sync only)
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../types";

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;

  // Setters
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
}

/**
 * Auth Store with persistence for user data
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,

      // Setters
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      // Reset state (Logout)
      reset: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
