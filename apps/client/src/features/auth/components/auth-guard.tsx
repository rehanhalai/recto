/**
 * AuthGuard Component
 * Protects routes from unauthenticated access
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";
import { useAuthUnauthorizedHandler } from "../hooks/use-auth-unauthorized-handler";
import { useCurrentUser } from "../hooks/use-current-user";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = "/login",
  requireAuth = true,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isCheckingAuth } = useCurrentUser();
  const router = useRouter();

  useAuthUnauthorizedHandler();

  // Redirect if authentication requirement is not met
  useEffect(() => {
    if (!isCheckingAuth) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isCheckingAuth, requireAuth, redirectTo, router]);

  // Show loading state
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children if not authenticated and auth is required
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

/**
 * GuestGuard Component
 * Redirects authenticated users away from guest-only pages (login, signup)
 */
interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({
  children,
  redirectTo = "/",
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isCheckingAuth } = useCurrentUser();
  const router = useRouter();

  useAuthUnauthorizedHandler();

  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isCheckingAuth, redirectTo, router]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
