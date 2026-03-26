"use client";

import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "../components/LoginForm";
import { SignupForm } from "../components/SignupForm";

interface AuthPageProps {
  mode: "login" | "signup";
}

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === "login";
  const title = isLogin ? "Welcome back." : "Join Recto.";

  const footerSlot = isLogin ? (
    <p className="mt-6 text-center text-xs leading-5 text-[#7b6f64] dark:text-[#9b8b79]">
      By signing in, you agree to our terms and privacy policy.
    </p>
  ) : (
    <p className="mt-6 text-center text-xs leading-5 text-[#7b6f64] dark:text-[#9b8b79]">
      By signing up, you agree to our terms and privacy policy.
    </p>
  );

  return (
    <AuthLayout
      title={title}
      footerSlot={footerSlot}
      mobileShowLogoForTitle={!isLogin}
    >
      {isLogin ? <LoginForm /> : <SignupForm />}
    </AuthLayout>
  );
}
