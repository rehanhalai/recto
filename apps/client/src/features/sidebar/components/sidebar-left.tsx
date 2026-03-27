"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Binoculars,
  ListBullets,
  Bell,
  UserCircle,
  UserPlus,
  Gear,
  MagnifyingGlass,
  SignOut,
  SunIcon,
  MoonIcon,
  PencilSimple,
} from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/features/auth";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useCurrentRead } from "@/features/feed/hooks/useCurrentRead";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTheme } from "next-themes";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui";
import rectoLogoLight from "@recto/assets/logos/recto-logo-light.webp";
import rectoLogoDark from "@recto/assets/logos/recto-logo-dark.webp";
import { useState, useEffect } from "react";
import { SidebarCreatePostDialog } from "./sidebar-create-post-dialog";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  icon: any;
  hasNotificationDot?: boolean;
}> = [
  { href: "/feed", label: "Feed", icon: House },
  { href: "/browse", label: "Browse", icon: Binoculars },
  { href: "/lists", label: "Lists", icon: ListBullets },
  { href: "/search", label: "Search", icon: MagnifyingGlass },
  // {
  //   href: "/notifications",
  //   label: "Notifications",
  //   icon: Bell,
  //   hasNotificationDot: true,
  // },
];

export function SidebarLeft({
  showCurrentReading = true,
}: {
  showCurrentReading?: boolean;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logoutMutation = useLogout();
  const { data: currentRead, isLoading: isLoadingRead } =
    useCurrentRead(isAuthenticated);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  useCurrentUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkMode = currentTheme === "dark";
  const logoSrc = !mounted
    ? rectoLogoLight
    : isDarkMode
      ? rectoLogoLight
      : rectoLogoDark;

  const profileHref = user ? `/${user.userName}` : "/profile";

  const isActive = (href: string) => {
    if (href === "/feed") return pathname === "/feed";
    if (href === "/search") return pathname === "/search";
    if (user && href === `/${user.userName}`) {
      return pathname === `/${user.userName}`;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="h-full flex flex-col py-4 overflow-y-auto overflow-x-hidden border-r border-border-subtle/30">
      {/* ═══ LOGO (Desktop only) ═══ */}
      <div className="hidden lg:flex items-center justify-center px-4 pb-6">
        <Link href="/feed" className="flex items-center">
          <Image
            src={logoSrc}
            alt="Recto"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* ═══ MAIN NAVIGATION ═══ */}
      <ul className="flex flex-col gap-2 px-2 overflow-y-auto flex-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                // aria-label for better a11y
                aria-label={item.label}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-150 group",
                  "lg:justify-start md:justify-center min-h-[48px]",
                  active
                    ? "bg-card-surface border border-border-subtle text-ink font-semibold"
                    : "text-ink-muted hover:text-ink hover:bg-card-surface/50 border border-transparent",
                )}
              >
                <span className="relative flex-shrink-0">
                  <item.icon
                    size={20}
                    weight={active ? "fill" : "regular"}
                    className={cn(
                      "transition-colors",
                      active
                        ? "text-ink"
                        : "text-ink-muted group-hover:text-ink",
                    )}
                  />
                  {item.hasNotificationDot && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold border-2 border-paper dark:border-card" />
                  )}
                </span>
                <span className="hidden lg:inline text-base font-medium">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}

        {isAuthenticated ? (
          <li>
            <Link
              href={profileHref}
              aria-label="Profile"
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-150 group",
                "lg:justify-start md:justify-center min-h-12",
                isActive(profileHref)
                  ? "bg-card-surface border border-border-subtle text-ink font-semibold"
                  : "text-ink-muted hover:text-ink hover:bg-card-surface/50 border border-transparent",
              )}
            >
              <span className="shrink-0">
                <UserCircle
                  size={20}
                  weight={isActive(profileHref) ? "fill" : "regular"}
                  className={cn(
                    "transition-colors",
                    isActive(profileHref)
                      ? "text-ink"
                      : "text-ink-muted group-hover:text-ink",
                  )}
                />
              </span>
              <span className="hidden lg:inline text-base font-medium">
                Profile
              </span>
            </Link>
          </li>
        ) : null}

        {isAuthenticated && (
          <li className="hidden lg:block">
            <Button
              type="button"
              onClick={() => setIsCreatePostOpen(true)}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-base font-medium transition-all duration-150",
                "lg:justify-start md:justify-center min-h-[48px]",
                isCreatePostOpen
                  ? "bg-card-surface border-border-subtle text-ink"
                  : "text-ink-muted hover:text-ink hover:bg-card-surface/50 border-transparent",
              )}
            >
              <PencilSimple size={20} weight={isCreatePostOpen ? "fill" : "regular"} />
              <span className="hidden lg:inline">Create post</span>
            </Button>
          </li>
        )}
      </ul>

      {/* ═══ CURRENTLY READING (Desktop only) ═══ */}
      {showCurrentReading && isAuthenticated && (
        <div className="hidden lg:block px-4 py-4 border-y border-border-subtle/30">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">
            Currently Reading
          </p>

          {isLoadingRead ? (
            <div className="space-y-3">
              <Skeleton className="h-3 w-20" />
              <div className="flex items-start gap-2.5">
                <Skeleton className="w-6 h-8 rounded" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-2/3" />
                </div>
              </div>
            </div>
          ) : currentRead && currentRead.length > 0 ? (
            <div className="space-y-2.5 max-h-[120px] overflow-y-auto">
              {currentRead.slice(0, 2).map((read: (typeof currentRead)[0]) => (
                <CurrentReadingCard
                  key={read.id}
                  bookId={read.bookId}
                  title={read.book.title}
                  authors={read.book.authors}
                  coverUrl={read.book.coverImage}
                />
              ))}
            </div>
          ) : (
            <div>
              <Link
                href="/browse"
                className="text-sm text-ink-muted hover:text-ink transition-colors font-medium"
              >
                Start tracking →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ═══ FOOTER: THEME & USER ═══ */}
      <div className="hidden lg:flex flex-col gap-3 mt-auto pt-4 px-2">
        {/* Theme Toggle + Settings */}
        <div className="flex gap-2">
          <ThemeToggleButton />
          <Link
            href="/settings"
            aria-label="Settings"
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-150 group flex-1",
              "min-h-[48px]",
              isActive("/settings")
                ? "bg-card-surface border border-border-subtle text-ink"
                : "text-ink-muted hover:text-ink hover:bg-card-surface/50 border border-transparent",
            )}
          >
            <Gear
              size={20}
              weight={isActive("/settings") ? "fill" : "regular"}
              className="flex-shrink-0 transition-colors"
            />
            <span className="text-base font-medium">Settings</span>
          </Link>
          {isAuthenticated && (
            <button
              type="button"
              aria-label="Log out"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              className="flex items-center justify-center px-4 py-3.5 rounded-xl transition-all duration-150 min-h-[48px] border border-transparent text-red-500/80 hover:text-red-600 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SignOut size={20} className="flex-shrink-0" />
            </button>
          )}
        </div>

        {/* User Profile Card / Signup CTA */}
        {isAuthenticated && user ? (
          <UserProfileCard user={user} currentRead={currentRead || []} />
        ) : (
          <Link
            href="/signup"
            aria-label="Sign up"
            className="flex items-center gap-3 rounded-xl border border-[#cfb286] bg-[#f8efde] px-4 py-3.5 text-[#5e472e] transition hover:brightness-95 dark:border-[#5b472f] dark:bg-[#2a2118] dark:text-[#d6b383]"
          >
            <UserPlus size={20} weight="bold" />
            <span className="text-base font-medium">Sign up</span>
          </Link>
        )}
      </div>

      {isAuthenticated && (
        <SidebarCreatePostDialog
          open={isCreatePostOpen}
          onOpenChange={setIsCreatePostOpen}
        />
      )}
    </nav>
  );
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        disabled
        className="flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-transparent text-ink-muted min-h-[48px] flex-1"
      >
        <SunIcon size={20} className="flex-shrink-0" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-border-subtle text-ink-muted hover:text-ink hover:bg-card-surface/50 transition-all duration-150 min-h-[48px] flex-1"
    >
      {theme === "dark" ? (
        <MoonIcon size={20} className="flex-shrink-0" />
      ) : (
        <SunIcon size={20} className="flex-shrink-0" />
      )}
    </button>
  );
}

function UserProfileCard({
  user,
  currentRead,
}: {
  user: {
    avatarImage?: string | null;
    fullName?: string | null;
    userName: string;
  };
  currentRead?: any[];
}) {
  return (
    <Link
      href={`/${user.userName}`}
      className="group flex items-start gap-3 px-4 py-3.5 rounded-xl border border-border-subtle/40 bg-card-surface/40 hover:bg-card-surface/60 transition-colors duration-150"
    >
      {/* Avatar */}
      <UserAvatar
        src={user.avatarImage || null}
        fallbackName={user.fullName ?? user.userName}
        className="w-10 h-10 flex-shrink-0 ring-1 ring-border-subtle"
      />

      {/* User Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink truncate group-hover:text-accent transition-colors">
          {user.fullName || user.userName}
        </p>
        <p className="text-xs text-ink-muted truncate font-mono">
          @{user.userName}
        </p>

        {/* Currently Reading hint */}
        {currentRead && currentRead.length > 0 && (
          <p className="text-xs text-ink-muted mt-1.5 line-clamp-1">
            Reading:{" "}
            <span className="font-medium">{currentRead[0].book.title}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

function CurrentReadingCard({
  bookId,
  title,
  authors,
  coverUrl,
}: {
  bookId: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
}) {
  return (
    <Link
      href={`/book/${bookId}/${title.replaceAll(" ", "-")}`}
      className="block group"
    >
      <div className="flex items-start gap-2.5">
        <div className="relative w-6 h-8 rounded overflow-hidden shrink-0 bg-card-surface border border-border-subtle">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="24px"
            />
          ) : (
            <div className="w-full h-full bg-border-subtle/50" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-ink truncate leading-tight group-hover:text-accent transition-colors">
            {title}
          </p>
          <p className="text-[10px] text-ink-muted truncate mt-0.5">
            {authors.join(", ")}
          </p>
        </div>
      </div>
    </Link>
  );
}
