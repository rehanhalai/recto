/**
 * Auth Feature Exports
 * Centralized exports for authentication components, hooks, and utilities
 */

// Types
export * from "./types";

// Store
export {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
} from "./store/auth-store";

// Hooks
export { useAuth } from "./hooks/use-auth";
export { useCurrentUser } from "./hooks/use-current-user";
export { useSignup } from "./hooks/use-signup";
export { useVerifyOTP } from "./hooks/use-verify-otp";
export { useLogin } from "./hooks/use-login";
export { useLogout } from "./hooks/use-logout";
export { useUser } from "./hooks/use-user";
export { usePasswordReset } from "./hooks/use-password-reset";

// Components
export { AuthGuard, GuestGuard } from "./components/auth-guard";

// Services
export * from "./services/auth-api";
