"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	ArrowLeftIcon,
	ArrowClockwiseIcon,
	FloppyDiskIcon,
	SpinnerIcon,
	TrashIcon,
} from "@phosphor-icons/react";

import { AvatarImagePicker } from "@/components/avatar-image-picker";
import { CoverImagePicker } from "@/components/cover-image-picker";
import { StandardLayout } from "@/components/layout";
import { Button, Input, Label } from "@/components/ui";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useGenerateUsername } from "@/features/auth/hooks/use-username";
import { useUser } from "@/features/auth/hooks/use-user";
import { toast } from "@/lib/toast";

export default function UpdateProfilePage() {
	const router = useRouter();
	const { user, updateProfile, updateProfileImage, checkUsernameAvailability } =
		useUser();
	const { isCheckingAuth, currentUserQuery } = useCurrentUser();
	const { refetch: generateUsername, isFetching: isGeneratingName } =
		useGenerateUsername();

	const [fullName, setFullName] = useState("");
	const [userName, setUserName] = useState("");
	const [bio, setBio] = useState("");

	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [coverFile, setCoverFile] = useState<File | null>(null);
	const [removeAvatar, setRemoveAvatar] = useState(false);
	const [removeCover, setRemoveCover] = useState(false);

	const [isSavingDetails, setIsSavingDetails] = useState(false);
	const [isSavingMedia, setIsSavingMedia] = useState(false);

	const [isCheckingUsername, setIsCheckingUsername] = useState(false);
	const [usernameAvailability, setUsernameAvailability] = useState<
		"idle" | "invalid" | "available" | "taken"
	>("idle");

	const [detailsError, setDetailsError] = useState<string | null>(null);
	const profileUser = user ?? currentUserQuery.data;

	const onGoBack = () => {
		if (typeof window !== "undefined" && window.history.length > 1) {
			router.back();
			return;
		}

		router.push("/feed");
	};

	useEffect(() => {
		void currentUserQuery.refetch();
	}, [currentUserQuery.refetch]);

	useEffect(() => {
		if (!profileUser) {
			return;
		}

		setFullName(profileUser.fullName ?? "");
		setUserName(profileUser.userName ?? "");
		setBio(profileUser.bio ?? "");
	}, [profileUser]);

	useEffect(() => {
		const cleanedUserName = userName.trim().toLowerCase();

		if (!cleanedUserName || cleanedUserName === profileUser?.userName) {
			setUsernameAvailability("idle");
			setIsCheckingUsername(false);
			return;
		}

		const validLength = cleanedUserName.length >= 3 && cleanedUserName.length <= 30;
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
		}, 350);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [userName, checkUsernameAvailability, profileUser?.userName]);

	const currentCoverUrl = removeCover ? null : profileUser?.coverImage ?? null;

	const validateDetails = () => {
		const trimmedName = fullName.trim();
		const cleanedUserName = userName.trim().toLowerCase();

		if (!trimmedName) {
			return "Full name is required.";
		}

		if (trimmedName.length < 3 || trimmedName.length > 100) {
			return "Full name must be between 3 and 100 characters.";
		}

		if (!cleanedUserName) {
			return "Username is required.";
		}

		if (cleanedUserName.length < 3 || cleanedUserName.length > 30) {
			return "Username must be between 3 and 30 characters.";
		}

		if (!/^[a-zA-Z0-9_]+$/.test(cleanedUserName)) {
			return "Username can only contain letters, numbers, and underscores.";
		}

		if (bio.length > 300) {
			return "Bio must be 300 characters or fewer.";
		}

		return null;
	};

	const onGenerateUsername = async () => {
		try {
			const response = await generateUsername();
			const generated = response.data?.username;

			if (!generated) {
				toast.error("Unable to generate username right now.");
				return;
			}

			setUserName(generated);
		} catch {
			toast.error("Failed to generate username.");
		}
	};

	const onSaveDetails = async () => {
		if (!profileUser) {
			return;
		}

		const validationError = validateDetails();
		if (validationError) {
			setDetailsError(validationError);
			return;
		}

		setDetailsError(null);
		setIsSavingDetails(true);

		try {
			const normalizedUserName = userName.trim().toLowerCase();

			if (
				normalizedUserName !== profileUser.userName &&
				!(await checkUsernameAvailability(normalizedUserName))
			) {
				setDetailsError("Username is unavailable. Please choose another one.");
				return;
			}

			await updateProfile({
				fullName: fullName.trim(),
				userName: normalizedUserName,
				bio: bio.trim() || undefined,
			});

			toast.success("Profile details updated.");
		} catch {
			setDetailsError("Could not save profile details right now.");
		} finally {
			setIsSavingDetails(false);
		}
	};

	const onSaveMedia = async () => {
		if (!profileUser) {
			return;
		}

		const hasChanges = avatarFile || coverFile || removeAvatar || removeCover;
		if (!hasChanges) {
			toast.error("No media changes to save.");
			return;
		}

		setIsSavingMedia(true);

		try {
			await updateProfileImage({
				avatarFile,
				coverFile,
				removeAvatar,
				removeCover,
			});

			await currentUserQuery.refetch();
			router.refresh();

			setAvatarFile(null);
			setCoverFile(null);
			setRemoveAvatar(false);
			setRemoveCover(false);
			toast.success("Profile media updated.");
		} catch {
			toast.error("Could not update media right now.");
		} finally {
			setIsSavingMedia(false);
		}
	};

	if (isCheckingAuth) {
		return (
			<StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
				<div className="rounded-xl border border-border-subtle bg-card-surface p-6 text-sm text-ink-muted">
					Loading profile settings...
				</div>
			</StandardLayout>
		);
	}

	if (!profileUser) {
		return (
			<StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
				<div className="rounded-xl border border-border-subtle bg-card-surface p-6 text-center">
					<h1 className="text-xl font-semibold text-ink">Please log in</h1>
					<p className="mt-2 text-sm text-ink-muted">
						You need to be logged in to update your profile.
					</p>
					<Button className="mt-4" onClick={() => router.push("/login")}>Go to login</Button>
				</div>
			</StandardLayout>
		);
	}

	return (
		<StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
			<div className="mx-auto w-full max-w-3xl space-y-6">
				<section className="rounded-xl border border-border-subtle bg-card-surface p-5">
					<div className="flex items-start gap-3">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={onGoBack}
							className="h-9 w-9 lg:hidden"
							aria-label="Go back"
						>
							<ArrowLeftIcon size={18} weight="bold" />
						</Button>

						<h1 className="text-2xl font-semibold tracking-tight text-ink">
							Edit profile
						</h1>
					</div>
					<p className="mt-1 text-sm text-ink-muted">
						Update your public identity, bio, and profile media.
					</p>
				</section>

				<section className="space-y-4 rounded-xl border border-border-subtle bg-card-surface p-5">
					<div>
						<Label className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]">
							Full name
						</Label>
						<Input
							value={fullName}
							onChange={(event) => {
								setFullName(event.target.value);
								if (detailsError) {
									setDetailsError(null);
								}
							}}
							placeholder="Your full name"
							className="mt-2 h-11 rounded-lg border-[#dfd2c1] bg-[#f6efe5] text-[#211b16] placeholder:text-[#958779] focus-visible:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
						/>
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
								onClick={onGenerateUsername}
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

						<Input
							value={userName}
							onChange={(event) => {
								setUserName(event.target.value);
								if (detailsError) {
									setDetailsError(null);
								}
							}}
							placeholder="username"
							className="h-11 rounded-lg border-[#dfd2c1] bg-[#f6efe5] text-[#211b16] placeholder:text-[#958779] focus-visible:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
						/>

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

					<div>
						<Label className="text-xs font-medium uppercase tracking-[0.08em] text-[#7f7062] dark:text-[#a1907b]">
							Bio
						</Label>
						<textarea
							value={bio}
							onChange={(event) => {
								setBio(event.target.value);
								if (detailsError) {
									setDetailsError(null);
								}
							}}
							maxLength={300}
							placeholder="Tell people a little about yourself"
							className="mt-2 min-h-24 w-full rounded-lg border border-[#dfd2c1] bg-[#f6efe5] px-3 py-2 text-[#211b16] placeholder:text-[#958779] outline-none focus-visible:ring-2 focus-visible:ring-[#9f8047] dark:border-[#352d24] dark:bg-[#201a14] dark:text-[#f4eee5]"
						/>
						<p className="mt-1 text-right text-xs text-[#7f7062] dark:text-[#a1907b]">
							{bio.length}/300
						</p>
					</div>

					{detailsError && (
						<p className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
							{detailsError}
						</p>
					)}

					<div className="flex justify-end">
						<Button
							type="button"
							onClick={onSaveDetails}
							disabled={isSavingDetails}
							className="bg-[#1f1a16] text-[#faf5eb] hover:opacity-90 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
						>
							{isSavingDetails ? (
								<SpinnerIcon size={16} className="mr-2 animate-spin" />
							) : (
								<FloppyDiskIcon size={16} className="mr-2" />
							)}
							{isSavingDetails ? "Saving details..." : "Save details"}
						</Button>
					</div>
				</section>

				<section className="space-y-4 rounded-xl border border-border-subtle bg-card-surface p-5">
					<AvatarImagePicker
						label="Avatar"
						value={avatarFile}
						onChange={(file) => {
							setAvatarFile(file);
							setRemoveAvatar(false);
						}}
						currentImageUrl={removeAvatar ? null : profileUser.avatarImage}
						disabled={isSavingMedia}
					/>

					{profileUser.avatarImage && !avatarFile && !removeAvatar && (
						<div className="flex justify-center">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={isSavingMedia}
								onClick={() => setRemoveAvatar(true)}
								className="text-red-600 hover:text-red-700"
							>
								<TrashIcon size={14} className="mr-1" />
								Remove current avatar
							</Button>
						</div>
					)}

					<CoverImagePicker
						label="Cover image"
						value={coverFile}
						onChange={(file) => {
							setCoverFile(file);
							setRemoveCover(false);
						}}
						currentImageUrl={currentCoverUrl}
						disabled={isSavingMedia}
					/>

					{(coverFile || currentCoverUrl) && !removeCover && (
						<div className="flex justify-start">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={isSavingMedia}
								onClick={() => {
									setCoverFile(null);
									setRemoveCover(true);
								}}
								className="text-red-600 hover:text-red-700"
							>
								<TrashIcon size={14} className="mr-1" />
								Remove current cover
							</Button>
						</div>
					)}

					<div className="flex justify-end">
						<Button
							type="button"
							onClick={onSaveMedia}
							disabled={isSavingMedia}
							className="bg-[#1f1a16] text-[#faf5eb] hover:opacity-90 dark:bg-[#e9ddcb] dark:text-[#1f1a16]"
						>
							{isSavingMedia ? (
								<SpinnerIcon size={16} className="mr-2 animate-spin" />
							) : (
								<FloppyDiskIcon size={16} className="mr-2" />
							)}
							{isSavingMedia ? "Saving media..." : "Save media"}
						</Button>
					</div>
				</section>
			</div>
		</StandardLayout>
	);
}
