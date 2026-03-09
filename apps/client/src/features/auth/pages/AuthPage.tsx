"use client";

import { useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { AuthHeader } from "../components/AuthHeader";
import { AuthFooter } from "../components/AuthFooter";
import { LoginForm } from "../components/LoginForm";
import { SignupForm } from "../components/SignupForm";

interface AuthPageProps {
  mode: "login" | "signup";
}

export function AuthPage({ mode }: AuthPageProps) {
  const [signupStep, setSignupStep] = useState<
    "credentials" | "otp" | "success"
  >("credentials");
  const [signupEmail, setSignupEmail] = useState<string | undefined>();

  // Helper to determine title/subtitle based on mode and step
  const getHeaderProps = () => {
    if (mode === "login") {
      return {
        title: undefined, // Logo only for login as per original design? Or add "Welcome back"?
        // Original login design had: Logo centered, then "Sign in to your account to continue"
        subtitle: "Sign in to your account to continue",
      };
    } else {
      // Signup Mode
      if (signupStep === "credentials") {
        return {
          title: "Create your account",
          subtitle: undefined,
        };
      }
      // For OTP and Success, the SignupForm handles its own specific headers/icons
      // So we might render nothing in the main header or a simplified one?
      // Looking at the original Signup design, the Header logic was inside the form step conditional.
      // Let's keep the standard Header for Credentials step, and let SignupForm handle OTP/Success headers internally if they differ significantly.
      return { title: undefined, subtitle: undefined };
    }
  };

  const { title, subtitle } = getHeaderProps();
  const showStandardHeader =
    mode === "login" || (mode === "signup" && signupStep === "credentials");

  return (
    <AuthLayout>
      {showStandardHeader && <AuthHeader title={title} subtitle={subtitle} />}

      {mode === "login" ? (
        <LoginForm />
      ) : (
        <SignupForm
          onStepChange={(step, email) => {
            setSignupStep(step);
            if (email) setSignupEmail(email);
          }}
        />
      )}

      {/* Footer is only shown for Login or Signup (Credentials step) */}
      {(mode === "login" ||
        (mode === "signup" && signupStep === "credentials")) && (
        <AuthFooter mode={mode} />
      )}
    </AuthLayout>
  );
}
