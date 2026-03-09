"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleGoogleCallback } from "@/features/auth/services/auth-api";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Handle the Google OAuth callback
        const response = await handleGoogleCallback();
        console.log("Google OAuth callback response:", response);
        // Store user in auth store
        setUser(response.data?.user ?? null);
        router.push("/home");
      } catch (err) {
        console.error("Google authentication failed:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");

        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    processCallback();
  }, [router, setUser]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Failed
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Completing sign in...</h2>
        <p className="text-gray-600">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  );
}
