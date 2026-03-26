"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import { AvatarImagePicker } from "@/components/avatar-image-picker";
import {
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  SpinnerIcon,
  UserIcon,
} from "@phosphor-icons/react";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Label,
} from "@/components/ui";
import { useGenerateUsername } from "../hooks/use-username";
import { useSignup } from "../hooks/use-signup";
import { useUser } from "../hooks/use-user";
import { useVerifyOTP } from "../hooks/use-verify-otp";
import {
  otpSchema,
  signupCredentialsSchema,
  type OTPInput,
  type SignupCredentialsInput,
} from "../validation/schemas";
import { SocialAuth } from "./SocialAuth";
import Link from "next/link";

type SignupStep = "credentials" | "otp" | "profile" | "success";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
};

export function SignupForm() {
  const router = useRouter();
  const signupMutation = useSignup();
  const verifyOTPMutation = useVerifyOTP();
  const { refetch: generateUsername, isFetching: isGeneratingName } =
    useGenerateUsername();
  const { updateProfile, updateProfileImage, checkUsernameAvailability } =
    useUser();

  const [step, setStep] = useState<SignupStep>("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [signupEmail, setSignupEmail] = useState("");
  const [profileFullName, setProfileFullName] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [profileAvatarFile, setProfileAvatarFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<
    "idle" | "invalid" | "available" | "taken"
  >("idle");

  const credentialsForm = useForm<SignupCredentialsInput>({
    resolver: zodResolver(signupCredentialsSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const otpForm = useForm<OTPInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleGenerateName = async () => {
    try {
      const response = await generateUsername();
      const name = response.data?.username;

      if (!name) {
        toast.error("Unable to generate username right now.");
        return;
      }

      setProfileUsername(name);
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
        password: data.password,
      });

      setSignupEmail(data.email);
      setProfileFullName("");
      setProfileUsername("");
      setProfileAvatarFile(null);
      setStep("otp");
      toast.success("OTP sent to your email.");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        "Failed to send OTP. Please try again.",
      );
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

      setStep("profile");
      toast.success("Email verified successfully.");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        "OTP verification failed. Please try again.",
      );
      setGlobalError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCompleteProfile = async () => {
    const cleanedFullName = profileFullName.trim();
    const cleanedUsername = profileUsername.trim().toLowerCase();

    if (!cleanedFullName) {
      setGlobalError("Full name is required.");
      return;
    }

    if (cleanedFullName.length < 3 || cleanedFullName.length > 100) {
      setGlobalError("Full name must be between 3 and 100 characters.");
      return;
    }

    if (!cleanedUsername) {
      setGlobalError("Username is required.");
      return;
    }

    if (cleanedUsername.length < 3 || cleanedUsername.length > 30) {
      setGlobalError("Username must be between 3 and 30 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanedUsername)) {
      setGlobalError(
        "Username can only contain letters, numbers, and underscores.",
      );
      return;
    }

    setGlobalError(null);
    setIsSavingProfile(true);

    try {
      const isAvailable = await checkUsernameAvailability(cleanedUsername);
      if (!isAvailable) {
        setGlobalError("Username is unavailable. Please choose another one.");
        return;
      }

      await updateProfile({
        fullName: cleanedFullName,
        userName: cleanedUsername,
      });

      if (profileAvatarFile) {
        await updateProfileImage(profileAvatarFile);
      }

      setStep("success");
      toast.success("Profile completed successfully.");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        "Could not save profile right now.",
      );
      setGlobalError(errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    const cleanedUsername = profileUsername.trim().toLowerCase();

    if (!cleanedUsername) {
      setUsernameAvailability("idle");
      setIsCheckingUsername(false);
      return;
    }

    const isValidLength =
      cleanedUsername.length >= 3 && cleanedUsername.length <= 30;
    const isValidPattern = /^[a-zA-Z0-9_]+$/.test(cleanedUsername);

    if (!isValidLength || !isValidPattern) {
      setUsernameAvailability("invalid");
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const isAvailable = await checkUsernameAvailability(cleanedUsername);
        setUsernameAvailability(isAvailable ? "available" : "taken");
      } catch {
        setUsernameAvailability("idle");
      } finally {
        setIsCheckingUsername(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [profileUsername, checkUsernameAvailability]);

  if (step === "credentials") {
    const isSubmitting = signupMutation.isPending;

    return (
      <div className="space-y-5">
        {globalError && (
          <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
            <p className="text-sm text-red-700 dark:text-red-300">
              {globalError}
            </p>
          </div>
        )}

        <form
          onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
          className="space-y-4"
        >
          <div>
            <Label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]"
            >
              Email
            </Label>
            <div className="relative mt-2">
              <EnvelopeIcon
                size={18}
                className="absolute left-3 top-3 text-[#9a8d80] dark:text-[#8f7f6b]"
              />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-lg border-[#dfd2c1] bg-[#f6efe5] pl-10 text-[#211b16] placeholder:text-[#958779] focus-visible:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
                {...credentialsForm.register("email")}
              />
            </div>
            {credentialsForm.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                {credentialsForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]"
            >
              Password
            </Label>
            <div className="relative mt-2">
              <LockIcon
                size={18}
                className="absolute left-3 top-3 text-[#9a8d80] dark:text-[#8f7f6b]"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                className="h-11 rounded-lg border-[#dfd2c1] bg-[#f6efe5] pl-10 pr-10 text-[#211b16] placeholder:text-[#958779] focus-visible:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
                {...credentialsForm.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3 text-[#9a8d80] transition-colors hover:text-[#211b16] dark:text-[#8f7f6b] dark:hover:text-[#f4eee5]"
              >
                {showPassword ? (
                  <EyeSlashIcon size={18} />
                ) : (
                  <EyeIcon size={18} />
                )}
              </button>
            </div>
            {credentialsForm.formState.errors.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                {credentialsForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 w-full rounded-lg bg-[#1f1a16] text-[15px] font-medium text-[#faf5eb] transition hover:opacity-90 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
            size="lg"
          >
            {isSubmitting && (
              <SpinnerIcon size={18} className="mr-2 animate-spin" />
            )}
            {isSubmitting ? "Sending OTP..." : "Create account"}
          </Button>
        </form>
        <p className="mt-2 text-sm leading-6 text-[#6f6154] dark:text-[#a1907b]">
          {
            <>
              <span>Already have an account? </span>
              <Link
                href="/login"
                className="font-medium text-[#8a6b37] hover:underline"
              >
                Log in
              </Link>
            </>
          }
        </p>

        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[#9a8d80] dark:text-[#8f7f6b]">
          <span className="h-px flex-1 bg-[#dfd2c1] dark:bg-[#352d24]" />
          <span>or continue with Google</span>
          <span className="h-px flex-1 bg-[#dfd2c1] dark:bg-[#352d24]" />
        </div>

        <SocialAuth actionText="Continue with Google" />
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-6">
        {globalError && (
          <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
            <p className="text-sm text-red-700 dark:text-red-300">
              {globalError}
            </p>
          </div>
        )}

        <div className="rounded-lg border border-[#dfd2c1] bg-[#f6efe5] p-4 text-sm text-[#66584c] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#a1907b]">
          We sent a 6-digit verification code to
          <span className="ml-1 font-semibold text-[#1f1a16] dark:text-[#f4eee5]">
            {signupEmail}
          </span>
          .
        </div>

        <Form {...otpForm}>
          <form
            className="space-y-5"
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
                            index={0}
                            className="border-[#d8c7b1] bg-[#f8f3ea] dark:border-[#3a3128] dark:bg-[#1e1813]"
                          />
                          <InputOTPSlot
                            index={1}
                            className="border-[#d8c7b1] bg-[#f8f3ea] dark:border-[#3a3128] dark:bg-[#1e1813]"
                          />
                          <InputOTPSlot
                            index={2}
                            className="border-[#d8c7b1] bg-[#f8f3ea] dark:border-[#3a3128] dark:bg-[#1e1813]"
                          />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={3}
                            className="border-[#d8c7b1] bg-[#f8f3ea] dark:border-[#3a3128] dark:bg-[#1e1813]"
                          />
                          <InputOTPSlot
                            index={4}
                            className="border-[#d8c7b1] bg-[#f8f3ea] dark:border-[#3a3128] dark:bg-[#1e1813]"
                          />
                          <InputOTPSlot
                            index={5}
                            className="border-[#d8c7b1] bg-[#f8f3ea] dark:border-[#3a3128] dark:bg-[#1e1813]"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={verifyOTPMutation.isPending}
              className="h-11 w-full rounded-lg bg-[#1f1a16] text-[15px] font-medium text-[#faf5eb] transition hover:opacity-90 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
            >
              {verifyOTPMutation.isPending && (
                <SpinnerIcon size={18} className="mr-2 animate-spin" />
              )}
              {verifyOTPMutation.isPending ? "Verifying..." : "Verify email"}
            </Button>
          </form>
        </Form>

        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setStep("credentials");
            setGlobalError(null);
          }}
          className="h-10 w-full text-[#8a6b37] hover:bg-[#f0e5d7] hover:text-[#71572f] dark:hover:bg-[#251e17]"
        >
          <ArrowLeftIcon size={16} className="mr-2" />
          Back to details
        </Button>
      </div>
    );
  }

  if (step === "profile") {
    return (
      <div className="space-y-5">
        {globalError && (
          <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
            <p className="text-sm text-red-700 dark:text-red-300">
              {globalError}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-[#cfb286] bg-[#f8efde] p-4 shadow-[0_10px_28px_rgba(118,82,34,0.12)] dark:border-[#5b472f] dark:bg-[#2a2118]">
          <AvatarImagePicker
            label="Profile picture (highlighted)"
            value={profileAvatarFile}
            onChange={setProfileAvatarFile}
            disabled={isSavingProfile}
          />
        </div>

        <div>
          <Label className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]">
            Full name
          </Label>

          <div className="relative mt-2">
            <UserIcon
              size={18}
              className="absolute left-3 top-3 text-[#9a8d80] dark:text-[#8f7f6b]"
            />
            <Input
              value={profileFullName}
              onChange={(event) => {
                setProfileFullName(event.target.value);
                if (globalError) {
                  setGlobalError(null);
                }
              }}
              placeholder="John Doe"
              className="h-11 rounded-lg border-[#dfd2c1] bg-[#f6efe5] pl-10 text-[#211b16] placeholder:text-[#958779] focus-visible:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
            />
          </div>
          <p className="mt-1 text-xs text-[#7f7062] dark:text-[#a1907b]">
            Use 3-100 characters.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]">
              Username
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGenerateName}
              disabled={isGeneratingName}
              className="h-6 px-2 text-xs text-[#8a6b37] hover:text-[#705630]"
            >
              {isGeneratingName ? (
                <SpinnerIcon size={14} className="mr-1 animate-spin" />
              ) : (
                <ArrowClockwiseIcon size={14} className="mr-1" />
              )}
              Suggest
            </Button>
          </div>

          <div className="relative">
            <UserIcon
              size={18}
              className="absolute left-3 top-3 text-[#9a8d80] dark:text-[#8f7f6b]"
            />
            <Input
              value={profileUsername}
              onChange={(event) => {
                setProfileUsername(event.target.value);
                if (globalError) {
                  setGlobalError(null);
                }
              }}
              placeholder="john_doe"
              className="h-11 rounded-lg border-[#dfd2c1] bg-[#f6efe5] pl-10 text-[#211b16] placeholder:text-[#958779] focus-visible:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
            />
          </div>
          <p className="mt-1 text-xs text-[#7f7062] dark:text-[#a1907b]">
            Use 3-30 characters: letters, numbers, and underscores.
          </p>
          {(isCheckingUsername || usernameAvailability !== "idle") && (
            <p
              className={`mt-1 text-xs ${
                usernameAvailability === "available"
                  ? "text-emerald-700 dark:text-emerald-300"
                  : usernameAvailability === "taken"
                    ? "text-red-700 dark:text-red-300"
                    : usernameAvailability === "invalid"
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-[#7f7062] dark:text-[#a1907b]"
              }`}
            >
              {isCheckingUsername
                ? "Checking availability..."
                : usernameAvailability === "available"
                  ? "Username is available"
                  : usernameAvailability === "taken"
                    ? "Username is already taken"
                    : "Invalid username format"}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-dashed border-[#d8c7b1] bg-[#f6efe5] px-4 py-3 text-sm text-[#66584c] dark:border-[#3a3128] dark:bg-[#201a14] dark:text-[#a1907b]">
          Account verified. Add your full name and choose your public username
          to continue. You can add a profile picture now or later.
        </div>

        <Button
          type="button"
          onClick={handleCompleteProfile}
          disabled={isSavingProfile}
          className="h-11 w-full rounded-lg bg-[#1f1a16] text-[15px] font-medium text-[#faf5eb] transition hover:opacity-90 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
        >
          {isSavingProfile && (
            <SpinnerIcon size={18} className="mr-2 animate-spin" />
          )}
          {isSavingProfile ? "Saving..." : "Continue"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8dac6] dark:bg-[#2b241c]">
        <CheckCircleIcon size={34} weight="fill" className="text-[#8a6b37]" />
      </div>

      <div>
        <h3 className="font-serif text-3xl leading-tight tracking-tight text-[#1f1a16] dark:text-[#f4eee4]">
          You&apos;re in.
        </h3>
        <p className="mt-2 text-sm text-[#6f6154] dark:text-[#a1907b]">
          Your shelf is ready. Start exploring books and building your reading
          timeline.
        </p>
      </div>

      <Button
        onClick={() => router.push("/feed")}
        className="h-11 w-full rounded-lg bg-[#1f1a16] text-[15px] font-medium text-[#faf5eb] transition hover:opacity-90 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
      >
        Go to my feed
      </Button>
    </div>
  );
}
