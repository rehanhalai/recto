"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Camera,
  PencilSimple,
  X,
  Info,
  ArrowClockwise,
  Spinner,
  CaretLeft,
} from "@phosphor-icons/react";

import { StandardLayout } from "@/components/layout";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useGenerateUsername } from "@/features/auth/hooks/use-username";
import { useUser } from "@/features/auth/hooks/use-user";
import { toast } from "@/lib/toast";

const BIO_LIMIT = 160;

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  userName: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  bio: z
    .string()
    .max(BIO_LIMIT, `Bio must be at most ${BIO_LIMIT} characters`)
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function UpdateProfilePage() {
  const router = useRouter();
  const { user, updateProfile, updateProfileImage, checkUsernameAvailability } =
    useUser();
  const { isCheckingAuth, currentUserQuery } = useCurrentUser();
  const { refetch: generateUsername, isFetching: isGeneratingName } =
    useGenerateUsername();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);

  const [saving, setSaving] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<
    "idle" | "invalid" | "available" | "taken"
  >("idle");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const profileUser = user ?? currentUserQuery.data;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      userName: "",
      bio: "",
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (!profileUser) return;
    form.reset({
      fullName: profileUser.fullName ?? "",
      userName: profileUser.userName ?? "",
      bio: profileUser.bio ?? "",
    });
  }, [profileUser, form]);

  // Handle username availability check
  const watchedUserName = form.watch("userName");

  useEffect(() => {
    const cleanedUserName = watchedUserName.trim().toLowerCase();

    if (!cleanedUserName || cleanedUserName === profileUser?.userName) {
      setUsernameAvailability("idle");
      setIsCheckingUsername(false);
      return;
    }

    const validLength =
      cleanedUserName.length >= 3 && cleanedUserName.length <= 30;
    const validPattern = /^[a-zA-Z0-9_]+$/.test(cleanedUserName);

    if (!validLength || !validPattern) {
      setUsernameAvailability("invalid");
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const available = await checkUsernameAvailability(cleanedUserName);
        setUsernameAvailability(available ? "available" : "taken");
      } catch {
        setUsernameAvailability("idle");
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [watchedUserName, checkUsernameAvailability, profileUser?.userName]);

  // Image Previews
  const avatarPreview = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    if (removeAvatar) return null;
    return profileUser?.avatarImage || null;
  }, [avatarFile, removeAvatar, profileUser?.avatarImage]);

  const coverPreview = useMemo(() => {
    if (coverFile) return URL.createObjectURL(coverFile);
    if (removeCover) return null;
    return profileUser?.coverImage || null;
  }, [coverFile, removeCover, profileUser?.coverImage]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "avatar" | "cover",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "avatar") {
      setAvatarFile(file);
      setRemoveAvatar(false);
    } else {
      setCoverFile(file);
      setRemoveCover(false);
    }
    e.target.value = "";
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!profileUser) return;

    if (usernameAvailability === "taken") {
      form.setError("userName", { message: "Username is already taken" });
      return;
    }

    setSaving(true);
    try {
      // 1. Save media if changed
      const hasMediaChanges =
        avatarFile || coverFile || removeAvatar || removeCover;
      if (hasMediaChanges) {
        await updateProfileImage({
          avatarFile,
          coverFile,
          removeAvatar,
          removeCover,
        });
      }

      // 2. Save profile details
      await updateProfile({
        fullName: values.fullName.trim(),
        userName: values.userName.trim().toLowerCase(),
        bio: values.bio?.trim() || undefined,
      });

      await currentUserQuery.refetch();
      toast.success("Profile updated successfully!");
      router.refresh();

      setAvatarFile(null);
      setCoverFile(null);
      setRemoveAvatar(false);
      setRemoveCover(false);
    } catch (error: any) {
      toast.error(error?.message || "Could not save profile right now.");
    } finally {
      setSaving(false);
    }
  };

  const onGenerateUsername = async () => {
    try {
      const response = await generateUsername();
      if (response.data?.username) {
        form.setValue("userName", response.data.username, {
          shouldValidate: true,
        });
      }
    } catch {
      toast.error("Failed to generate username.");
    }
  };

  const bio = form.watch("bio") || "";
  const bioRemaining = BIO_LIMIT - bio.length;
  const bioProgress = (bio.length / BIO_LIMIT) * 100;

  if (isCheckingAuth) {
    return (
      <StandardLayout
        leftSidebar={<SidebarLeft />}
        rightSidebar={<SidebarRight />}
      >
        <div className="rounded-xl border border-border-subtle bg-card-surface p-12 flex flex-col items-center justify-center gap-4">
          <Spinner size={32} className="animate-spin text-accent" />
          <p className="text-sm text-ink-muted italic">
            preparing your shelf...
          </p>
        </div>
      </StandardLayout>
    );
  }

  if (!profileUser) {
    return (
      <StandardLayout
        leftSidebar={<SidebarLeft />}
        rightSidebar={<SidebarRight />}
      >
        <div className="rounded-xl border border-border-subtle bg-card-surface p-12 text-center">
          <h1 className="text-2xl italic mb-4">
            A shelf for everyone, but first...
          </h1>
          <p className="text-ink-muted mb-6">
            You need to be logged in to edit your profile.
          </p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout
      leftSidebar={<SidebarLeft />}
      rightSidebar={<SidebarRight />}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-paper text-ink selection:bg-gold/30 rounded-xl border border-border-subtle overflow-hidden"
        >
          {/* ── Sticky nav ── */}
          <header className="sticky top-0 z-50 flex items-center px-6 h-14 bg-paper/90 backdrop-blur-md border-b border-border-subtle">
            <div className="flex items-center gap-4 relative z-10">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-1.5 -ml-2 rounded-full hover:bg-black/5 transition-colors text-ink-muted hover:text-ink lg:hidden"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
            </div>

            <span className="absolute left-1/2 -translate-x-1/2 text-[0.7rem] uppercase tracking-widest text-ink-muted font-semibold">
              Edit Profile
            </span>
          </header>

          <main className="pb-16">
            {/* ── Cover image section ── */}
            <div className="relative w-full h-44 bg-[#211b16] overflow-hidden group">
              {coverPreview && coverPreview.startsWith("http") ? (
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="object-cover w-full h-full"
                />
              ) : coverPreview ? (
                <Image
                  src={coverPreview}
                  alt="Cover"
                  fill
                  className="object-cover"
                  unoptimized={!!coverFile}
                />
              ) : null}

              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-4 right-4 flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest px-3 py-1.5 rounded-md
                           bg-paper/10 backdrop-blur border border-white/20 text-white
                           hover:bg-paper/20 transition-all font-medium"
              >
                <PencilSimple size={12} weight="bold" />
                Change Cover
              </button>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleImageChange(e, "cover")}
              />
            </div>

            {/* ── Avatar + Name preview ── */}
            <div className="flex items-end gap-5 px-8 -mt-10 relative z-10">
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-full border-4 border-paper bg-[#211b16] overflow-hidden shadow-xl ring-1 ring-black/5">
                  {avatarPreview && avatarPreview.startsWith("http") ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar"
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                      unoptimized={!!avatarFile}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="italic text-4xl text-paper/20">
                        {(form.watch("fullName")?.[0] || "?").toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-accent border-2 border-paper flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <PencilSimple
                    size={14}
                    weight="bold"
                    className="text-paper"
                  />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleImageChange(e, "avatar")}
                />
              </div>

              <div className="pb-2 min-w-0">
                <h2 className="text-2xl leading-tight truncate text-ink font-semibold">
                  {form.watch("fullName") || (
                    <span className="opacity-30">Your Name</span>
                  )}
                </h2>
                <p className="text-sm text-ink-muted font-mono truncate">
                  {form.watch("userName")
                    ? `@${form.watch("userName")}`
                    : "@username"}
                </p>
              </div>
            </div>

            {/* ── Form Controls ── */}
            <div className="px-8 flex flex-col gap-6 w-full mt-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-2 w-full">
                    <FormLabel className="font-semibold text-[0.65rem] uppercase tracking-[0.12em] text-ink-muted flex items-center gap-1">
                      Full Name <span className="text-gold">✦</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Name"
                        className="field-input h-11 font-sans w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[0.6rem]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem className="space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-semibold text-[0.65rem] uppercase tracking-[0.12em] text-ink-muted flex items-center gap-1">
                        Username <span className="text-gold">✦</span>
                      </FormLabel>
                      <button
                        type="button"
                        onClick={onGenerateUsername}
                        className="text-[0.6rem] uppercase tracking-wider text-gold hover:text-gold-muted flex items-center gap-1 font-bold"
                      >
                        <ArrowClockwise size={10} weight="bold" />
                        Suggest
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted/40 font-sans">
                          @
                        </span>
                        <Input
                          placeholder="handle"
                          className={`field-input h-11 pl-8 font-sans w-full ${usernameAvailability === "taken" ? "border-red-400 focus:border-red-400" : ""}`}
                          {...field}
                          onChange={(e) => {
                            field.onChange(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9_]/g, ""),
                            );
                          }}
                        />
                      </div>
                    </FormControl>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-[0.6rem] font-medium ${
                          usernameAvailability === "available"
                            ? "text-green-500"
                            : usernameAvailability === "taken"
                              ? "text-red-500"
                              : "text-ink-muted/50"
                        }`}
                      >
                        {isCheckingUsername
                          ? "Checking availability..."
                          : usernameAvailability === "available"
                            ? "✔ Handle is available"
                            : usernameAvailability === "taken"
                              ? "✘ Handle is taken"
                              : `recto.social/${field.value || "handle"}`}
                      </p>
                      <FormMessage className="text-[0.6rem]" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="space-y-2 w-full">
                    <FormLabel className="font-semibold text-[0.65rem] uppercase tracking-[0.12em] text-ink-muted">
                      Bio
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A sentence about you..."
                        rows={4}
                        className="field-input resize-none min-h-25 font-sans w-full"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex items-center justify-between mt-1">
                      <FormMessage className="text-[0.6rem]" />
                      {!form.formState.errors.bio && (
                        <p className="text-[0.65rem] text-ink-muted/60 italic">
                          Shown on your profile and hover cards.
                        </p>
                      )}
                      <div className="flex items-center gap-3 ml-auto">
                        <div className="w-24 h-1 bg-border-subtle overflow-hidden rounded-full">
                          <div
                            className={`h-full transition-all duration-300 ${bioRemaining < 20 ? "bg-red-400" : "bg-gold"}`}
                            style={{ width: `${bioProgress}%` }}
                          />
                        </div>
                        <span
                          className={`text-[0.65rem] font-mono tabular-nums ${bioRemaining < 10 ? "text-red-500 font-bold" : "text-ink-muted/70"}`}
                        >
                          {bio.length}/{BIO_LIMIT}
                        </span>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* ── Info section ── */}
            <div className="mx-8 mt-12 p-4 bg-card-surface/50 border border-border-subtle rounded-lg flex gap-4">
              <Info size={18} className="text-gold shrink-0 mt-0.5" />
              <div className="text-[0.7rem] leading-relaxed text-ink-muted/80">
                <p>
                  Your{" "}
                  <strong className="text-ink">avatar and cover image</strong>{" "}
                  are resized on upload — 1:1 for avatar, 3:1 for cover. JPG,
                  PNG or WebP up to 5 MB.
                </p>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="px-8 mt-12 mb-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="w-full sm:w-auto text-sm px-4 py-3 sm:py-2 rounded-md border border-border-subtle text-ink-muted hover:text-ink hover:border-ink/20 transition-all font-medium"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={saving || usernameAvailability === "taken"}
                className="w-full sm:w-auto text-sm px-8 py-3 sm:py-2 rounded-md bg-accent text-paper hover:bg-accent-dark transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {saving && <Spinner size={14} className="animate-spin" />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </main>
        </form>
      </Form>
    </StandardLayout>
  );
}
