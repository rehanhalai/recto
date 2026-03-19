import { create } from "zustand";
import type { User } from "@recto/types"; // Assume there's a User type or generic

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  setUser: (user: any | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
