"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import {
  LockIcon,
  EnvelopeIcon,
  UserIcon,
  SpinnerIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowClockwiseIcon,
} from "@phosphor-icons/react";

import {
  Button,
  Input,
  Label,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui";
import { useSignup } from "../hooks/use-signup";
import { useVerifyOTP } from "../hooks/use-verify-otp";
import { useGenerateUsername } from "../hooks/use-username";
import {
  otpSchema,
  signupCredentialsSchema,
  type OTPInput,
  type SignupCredentialsInput,
} from "../validation/schemas";
import { SocialAuth } from "./SocialAuth";

type SignupStep = "credentials" | "otp" | "success";

interface SignupFormProps {
  onStepChange: (step: SignupStep, email?: string) => void;
}

export function SignupForm({ onStepChange }: SignupFormProps) {
  const router = useRouter();
  const signupMutation = useSignup();
  const verifyOTPMutation = useVerifyOTP();
  const { refetch: generateUsername, isFetching: isGeneratingName } =
    useGenerateUsername();

  const [step, setStep] = useState<SignupStep>("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupUsername, setSignupUsername] = useState("");

  const credentialsForm = useForm<SignupCredentialsInput>({
    resolver: zodResolver(signupCredentialsSchema),
  });

  const otpForm = useForm<OTPInput>({
    resolver: zodResolver(otpSchema),
  });

  const handleGenerateName = async () => {
    try {
      const { data } = await generateUsername();
      if (data?.username) {
        credentialsForm.setValue("username", data.username);
      }
    } catch (error) {
      console.error("Failed to generate username", error);
      toast.error("Failed to generate username");
    }
  };

  const onCredentialsSubmit = async (data: SignupCredentialsInput) => {
    setGlobalError(null);
    try {
      await signupMutation.mutateAsync({
        email: data.email,
        userName: data.username,
        password: data.password,
      });
      setSignupEmail(data.email);
      setSignupUsername(data.username);
      setStep("otp");
      onStepChange("otp", data.email);
      toast.success("OTP sent to your email!");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to send OTP. Please try again.";
      setGlobalError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const onOTPSubmit = async (data: OTPInput) => {
    setGlobalError(null);
    try {
      await verifyOTPMutation.mutateAsync({
        email: signupEmail,
        otp: data.otp,
      });
      setStep("success");
      onStepChange("success");
      toast.success("Email verified! Welcome to Recto!");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "OTP verification failed. Please try again.";
      setGlobalError(errorMessage);
      toast.error(errorMessage);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             View: Credentials                              */
  /* -------------------------------------------------------------------------- */
  if (step === "credentials") {
    return (
      <>
        {/* Error Alert */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{globalError}</p>
          </div>
        )}

        <form
          onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
          className="space-y-4"
        >
          {/* Email */}
          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email address
            </Label>
            <div className="relative mt-2">
              <EnvelopeIcon
                size={18}
                className="absolute left-3 top-3 text-muted-foreground"
              />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                {...credentialsForm.register("email")}
              />
            </div>
            {credentialsForm.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {credentialsForm.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <div className="flex justify-between items-center">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Username
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateName}
                disabled={isGeneratingName}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {isGeneratingName ? (
                  <SpinnerIcon className="animate-spin mr-1" />
                ) : (
                  <ArrowClockwiseIcon className="mr-1" />
                )}
                Generate Random
              </Button>
            </div>
            <div className="relative mt-2">
              <UserIcon
                size={18}
                className="absolute left-3 top-3 text-muted-foreground"
              />
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                className="pl-10"
                {...credentialsForm.register("username")}
              />
            </div>
            {credentialsForm.formState.errors.username && (
              <p className="mt-1 text-xs text-red-600">
                {credentialsForm.formState.errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </Label>
            <div className="relative mt-2">
              <LockIcon
                size={18}
                className="absolute left-3 top-3 text-muted-foreground"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...credentialsForm.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon size={18} />
                ) : (
                  <EyeIcon size={18} />
                )}
              </button>
            </div>
                disabled={signupMutation.isPending}
              8+ characters with uppercase letter and number
            </p>
            {credentialsForm.formState.errors.password && (
                {signupMutation.isPending && (
                {credentialsForm.formState.errors.password.message}
              </p>
                {signupMutation.isPending ? "Sending OTP..." : "Create account"}
          </div>

          {/* Confirm Password */}
          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-foreground"
            >
              Confirm password
            </Label>
            <div className="relative mt-2">
              <LockIcon
                size={18}
                className="absolute left-3 top-3 text-muted-foreground"
              />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...credentialsForm.register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon size={18} />
                ) : (
                  <EyeIcon size={18} />
                )}
              </button>
            </div>
                disabled={verifyOTPMutation.isPending}
              <p className="mt-1 text-xs text-red-600">
                {credentialsForm.formState.errors.confirmPassword.message}
              </p>
                {verifyOTPMutation.isPending && (
          </div>

                {verifyOTPMutation.isPending
                  ? "Verifying..."
                  : "Verify & Complete"}
          <Button
            type="submit"
            disabled={isSigningUp}
            className="w-full mt-6 bg-black hover:bg-gray-900 text-white font-medium py-2.5"
            size="lg"
          >
            {isSigningUp && (
              <SpinnerIcon size={18} className="mr-2 animate-spin" />
            )}
            {isSigningUp ? "Creating account..." : "Continue"}
          </Button>
        </form>

        <SocialAuth actionText="Sign up with Google" />
      </>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                View: OTP                                   */
  /* -------------------------------------------------------------------------- */
  if (step === "otp") {
    return (
      <div className="w-full space-y-6">
        {/* Header with Icon */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C2410C]/10">
            <EnvelopeIcon className="h-6 w-6 text-[#C2410C]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#1C1917] dark:text-[#E7E5E4]">
            Check your email
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A8A8A8]">
            We sent a verification code to{" "}
            <span className="font-medium text-[#1C1917] dark:text-[#E7E5E4]">
              {signupEmail}
            </span>
          </p>
        </div>

        {/* Error Alert */}
        {globalError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{globalError}</p>
          </div>
        )}

        {/* OTP Form */}
        <Form {...otpForm}>
          <form
            className="space-y-6"
            onSubmit={otpForm.handleSubmit(onOTPSubmit)}
          >
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot
                            className="bg-[#FDFBF7] dark:bg-[#2D2B2A] border-[#E5E5E5] dark:border-[#3D3B3A]"
                            index={0}
                          />
                          <InputOTPSlot
                            className="bg-[#FDFBF7] dark:bg-[#2D2B2A] border-[#E5E5E5] dark:border-[#3D3B3A]"
                            index={1}
                          />
                          <InputOTPSlot
                            className="bg-[#FDFBF7] dark:bg-[#2D2B2A] border-[#E5E5E5] dark:border-[#3D3B3A]"
                            index={2}
                          />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot
                            className="bg-[#FDFBF7] dark:bg-[#2D2B2A] border-[#E5E5E5] dark:border-[#3D3B3A]"
                            index={3}
                          />
                          <InputOTPSlot
                            className="bg-[#FDFBF7] dark:bg-[#2D2B2A] border-[#E5E5E5] dark:border-[#3D3B3A]"
                            index={4}
                          />
                          <InputOTPSlot
                            className="bg-[#FDFBF7] dark:bg-[#2D2B2A] border-[#E5E5E5] dark:border-[#3D3B3A]"
                            index={5}
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Verify Button */}
            <Button
              className="w-full bg-[#C2410C] hover:bg-[#A83408] text-white font-semibold py-2.5"
              disabled={isVerifyingOTP}
              type="submit"
              size="lg"
            >
              {isVerifyingOTP ? "Verifying..." : "Verify Email"}
            </Button>

            {/* Resend Section */}
            <div className="text-center text-sm text-[#6B6B6B] dark:text-[#A8A8A8]">
              Didn't receive the email?{" "}
              <Button
                className="h-auto p-0 font-normal text-[#C2410C] hover:text-[#A83408]"
                disabled={true}
                type="button"
                variant="link"
              >
                Resend code
              </Button>
            </div>

            {/* Back Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep("credentials");
                onStepChange("credentials");
                setGlobalError(null);
              }}
              className="w-full border-[#E5E5E5] dark:border-[#3D3B3A] text-[#1C1917] dark:text-[#E7E5E4] hover:bg-[#F5F3F0] dark:hover:bg-[#2D2B2A]"
            >
              <ArrowLeftIcon size={18} className="mr-2" />
              Back to details
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                              View: Success                                 */
  /* -------------------------------------------------------------------------- */
  if (step === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-black rounded-full opacity-20 animate-pulse" />
            <CheckCircleIcon
              size={80}
              weight="fill"
              className="text-black relative"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Account created!
          </h3>
          <p className="text-sm text-muted-foreground">
            Welcome to Recto, {signupUsername}. Your account is ready to go.
          </p>
        </div>

        <Button
          onClick={() => router.push("/feed")}
          className="w-full bg-black hover:bg-gray-900 text-white font-medium py-2.5"
          size="lg"
        >
          Go to Homepage
        </Button>
      </div>
    );
  }

  return null;
}
