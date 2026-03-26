"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  MagnifyingGlass,
  PencilSimple,
  Bell,
  UserCircle,
} from "@phosphor-icons/react";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuthStore } from "@/features/auth";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { unreadCount } = useNotifications();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/feed") return pathname === "/feed";
    if (href === "/search") return pathname === "/search";
    if (href === "/notifications") return pathname === "/notifications";
    if (href === "/profile")
      return user ? pathname.startsWith(`/user/${user.userName}`) : false;
    return false;
  };

  const feedActive = isActive("/feed");
  const searchActive = isActive("/search");
  const notificationsActive = isActive("/notifications");
  const profileActive = isActive("/profile");

  const profileHref = user ? `/user/${user.userName}` : "/profile";

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 block lg:hidden z-40",
          "bg-card/95 dark:bg-card/95 backdrop-blur-md border-t border-border-subtle",
          "h-16",
        )}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="h-16 flex items-center justify-around px-2 max-w-full overflow-hidden">
          {/* Feed */}
          <NavItem
            href="/feed"
            icon={House}
            label="Feed"
            active={feedActive}
            iconSize={24}
          />

          {/* Search */}
          <NavItem
            href="/search"
            icon={MagnifyingGlass}
            label="Search"
            active={searchActive}
            iconSize={24}
          />

          {/* Compose Button (Center, Primary Action) */}
          <button
            onClick={() => setIsComposeOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center",
              "relative -mt-3", // Elevate above the navbar
              "w-12 h-12 rounded-2xl", // 48px × 48px, rounded square
              "bg-accent hover:bg-accent/90 transition-all duration-150",
              "active:scale-95",
              "ring ring-paper dark:ring-card",
              "flex-shrink-0",
              "shadow-lg",
            )}
            aria-label="Compose post"
            type="button"
          >
            <PencilSimple size={22} weight="bold" className="text-black" />
          </button>

          {/* Notifications */}
          <NavItem
            href="/notifications"
            icon={Bell}
            label="Notifications"
            active={notificationsActive}
            iconSize={24}
            badge={unreadCount > 0 ? unreadCount : undefined}
          />

          {/* Profile */}
          <ProfileNavItem
            href={profileHref}
            user={user}
            active={profileActive}
          />
        </div>
      </nav>

      {/* Compose Sheet Modal */}
      <Sheet open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Create a Post</SheetTitle>
          </SheetHeader>
          <div className="py-8 text-center text-ink-muted">
            {/* Compose form will go here */}
            <p>Post compose form will be implemented here</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface NavItemProps {
  href: string;
  icon: any;
  label: string;
  active: boolean;
  iconSize: number;
  badge?: number;
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  iconSize,
  badge,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center",
        "relative w-16 h-16",
        "transition-colors duration-150",
        "min-h-11 min-w-11", // Ensure 44px minimum tap target
        "group",
      )}
      aria-current={active ? "page" : undefined}
    >
      {/* Active indicator pill above icon */}
      {active && (
        <div className="absolute top-0 w-1 h-1 rounded-full bg-accent mb-1" />
      )}

      {/* Icon container with badge */}
      <div className="relative flex items-center justify-center mb-1">
        <Icon
          size={iconSize}
          weight={active ? "fill" : "regular"}
          className={cn(
            "transition-colors duration-150",
            active ? "text-accent" : "text-ink-muted group-hover:text-ink",
          )}
        />

        {/* Badge */}
        {badge !== undefined && badge > 0 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent border-1.5 border-card dark:border-card-surface" />
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[10px] font-medium leading-none",
          "transition-colors duration-150",
          "whitespace-nowrap",
          active ? "text-accent" : "text-ink-muted group-hover:text-ink",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

interface ProfileNavItemProps {
  href: string;
  user: {
    avatarImage?: string | null;
    fullName?: string | null;
    userName: string;
  } | null;
  active: boolean;
}

function ProfileNavItem({ href, user, active }: ProfileNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center",
        "relative w-16 h-16",
        "transition-colors duration-150",
        "min-h-11 min-w-11",
        "group",
      )}
      aria-current={active ? "page" : undefined}
    >
      {/* Active indicator pill above icon */}
      {active && (
        <div className="absolute top-0 w-1 h-1 rounded-full bg-accent mb-1" />
      )}

      {/* Avatar Icon */}
      <div className="mb-1">
        {user ? (
          <UserAvatar
            src={user.avatarImage || null}
            fallbackName={user.fullName ?? user.userName}
            className={cn(
              "w-6 h-6 transition-opacity duration-150",
              active ? "opacity-100" : "opacity-75 group-hover:opacity-100",
            )}
          />
        ) : (
          <div
            className={cn(
              "transition-colors duration-150",
              active ? "text-accent" : "text-ink-muted group-hover:text-ink",
            )}
          >
            <UserCircle size={24} weight={active ? "fill" : "regular"} />
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[10px] font-medium leading-none",
          "transition-colors duration-150",
          "whitespace-nowrap",
          active ? "text-accent" : "text-ink-muted group-hover:text-ink",
        )}
      >
        Profile
      </span>
    </Link>
  );
}
