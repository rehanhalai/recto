"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Binoculars,
  ListBullets,
  Bell,
  UserCircle,
  Gear,
} from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth";
import { useCurrentRead } from "@/features/feed/hooks/useCurrentRead";
import { cn } from "@/lib/utils";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/feed", label: "Feed", icon: House },
  { href: "/books", label: "Browse", icon: Binoculars },
  { href: "/lists", label: "Lists", icon: ListBullets },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
    hasNotificationDot: true,
  },
  // Profile href is dynamic — handled separately
  { href: "/settings", label: "Settings", icon: Gear },
] as const;

export function SidebarLeft() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: currentRead, isLoading: isLoadingRead } = useCurrentRead();

  const profileHref = user ? `/user/${user.userName}` : "/profile";

  const allNavItems = [
    ...NAV_ITEMS.slice(0, 4),
    {
      href: profileHref,
      label: "Profile",
      icon: UserCircle,
      hasNotificationDot: false,
    },
    ...NAV_ITEMS.slice(4),
  ];

  const isActive = (href: string) => {
    if (href === "/feed") return pathname === "/feed";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col py-4 overflow-y-auto">
      {/* Navigation Links */}
      <ul className="flex flex-col gap-1">
        {allNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  "lg:justify-start md:justify-center",
                  active
                    ? "bg-card-surface border border-border-subtle text-ink font-semibold"
                    : "text-ink-muted hover:text-ink hover:bg-card-surface/50 border border-transparent",
                )}
              >
                <span className="relative">
                  <item.icon
                    size={22}
                    weight={active ? "fill" : "regular"}
                    className={
                      active
                        ? "text-ink"
                        : "text-ink-muted group-hover:text-ink"
                    }
                  />
                  {/* {item.hasNotificationDot && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold border-2 border-paper" />
                  )} */}
                </span>
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Divider + Currently Reading (desktop only) */}
      <div className="hidden lg:block mt-4">
        <Separator className="bg-border-subtle/60 mb-4" />
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-muted mb-2">
          Currently reading
        </p>

        {isLoadingRead ? (
          <div className="px-3 space-y-3">
            <Skeleton className="h-3 w-24" />
            <div className="flex items-start gap-3">
              <Skeleton className="w-7 h-9.5 rounded" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-0.75 w-full rounded-full" />
          </div>
        ) : currentRead ? (
          currentRead.slice(0, 5).map((read: (typeof currentRead)[0]) => (
            <CurrentReadingCard
              key={read.id}
              bookId={read.bookId}
              title={read.book.title}
              author={read.book.authors?.[0]?.authorName ?? "Unknown"}
              coverUrl={read.book.coverImage}
              // progress={42}
            />
          ))
        ) : (
          <div className="px-3">
            <Link
              href="/books"
              className="text-sm text-ink-muted hover:text-ink transition-colors font-medium"
            >
              Start tracking →
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function CurrentReadingCard({
  bookId,
  title,
  author,
  coverUrl,
  //   progress,
}: {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  //   progress: number;
}) {
  return (
    <Link href={`/books/${bookId}`} className="block my-3 group">
      <div className="flex items-start gap-3">
        <div className="relative w-7 h-9.5 rounded overflow-hidden shrink-0 bg-card-surface border border-border-subtle">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="28px"
            />
          ) : (
            <div className="w-full h-full bg-border-subtle/50" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink truncate leading-tight group-hover:text-accent-dark transition-colors">
            {title}
          </p>
          <p className="text-xs text-ink-muted truncate mt-0.5">{author}</p>
        </div>
      </div>
      {/* Progress bar */}
      {/* <div className="mt-2.5">
        <div className="w-full h-0.75 bg-border-subtle/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-ink-muted mt-1 font-mono">
          {progress}% done
        </p>
      </div> */}
    </Link>
  );
}
