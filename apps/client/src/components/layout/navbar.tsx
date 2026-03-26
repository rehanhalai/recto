"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  GearIcon,
  UserIcon,
  SignOutIcon,
  CaretDownIcon,
  Bell,
  X,
  List as ListIcon,
  House,
  Binoculars,
  ListBullets,
} from "@phosphor-icons/react";
import {
  Button,
  Input,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { useAuthStore } from "@/features/auth";
import { useAuthUnauthorizedHandler } from "@/features/auth/hooks/use-auth-unauthorized-handler";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import rectoLogoDark from "@recto/assets/logos/recto-logo-dark.webp";
import rectoLogoLight from "@recto/assets/logos/recto-logo-light.webp";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logoutMutation = useLogout();
  const { theme, systemTheme } = useTheme();

  useCurrentUser();
  useAuthUnauthorizedHandler();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkMode = currentTheme === "dark";
  const isLandingPage = pathname === "/";
  const useDarkNavbarTheme = isLandingPage || isDarkMode;

  const logoSrc = !mounted
    ? rectoLogoLight
    : useDarkNavbarTheme
      ? rectoLogoLight
      : rectoLogoDark;

  const NavLinks = [
    { href: "/feed", label: "Home", icon: House },
    { href: "/books", label: "Browse", icon: Binoculars },
    { href: "/lists", label: "Lists", icon: ListBullets },
    { href: "/posts", label: "Posts", icon: ListIcon },
  ];

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 backdrop-blur-md transition-colors",
        isLandingPage
          ? "dark bg-black/90 border-b border-gold/25"
          : "bg-paper/85 dark:bg-card/85 border-b border-border-subtle shadow-xs",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* LEFT: LOGO (Now left-aligned on all screens) */}
          <Link
            href="/feed"
            className="shrink-0 group z-20 flex items-center gap-2"
          >
            <Image
              src={logoSrc}
              alt="Recto"
              priority
              width={110}
              height={34}
              className="h-8 w-auto transition-transform group-hover:scale-102"
            />
          </Link>

          {/* MIDDLE: DESKTOP NAVIGATION (Hidden on Mobile) */}
          <div
            className={cn(
              "hidden md:flex items-center gap-2 lg:gap-8 mx-auto transition-all duration-300",
              isSearchExpanded
                ? "opacity-0 invisible scale-95 pointer-events-none"
                : "opacity-100 visible scale-100",
            )}
          >
            {NavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-1 py-2 text-sm font-medium transition-colors relative group",
                  isLandingPage
                    ? "text-white/70 hover:text-gold"
                    : "text-ink-muted hover:text-accent",
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 w-full h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left",
                    isLandingPage ? "bg-gold" : "bg-accent",
                  )}
                />
              </Link>
            ))}
          </div>

          {/* RIGHT: ACTIONS + MOBILE MENU */}
          <div className="flex items-center gap-1 sm:gap-3 z-20 shrink-0">
            {/* Removed Search */}

            {/* NOTIFICATIONS (Visible on all screens) */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative text-ink-muted hover:text-ink h-10 w-10 transition-opacity",
                  isSearchExpanded &&
                    "opacity-0 invisible md:opacity-100 md:visible",
                )}
              >
                <Bell size={24} weight="regular" />
                <span
                  className={cn(
                    "absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-paper",
                    isLandingPage ? "bg-gold" : "bg-accent",
                  )}
                />
              </Button>
            )}

            {/* DESKTOP THEME TOGGLE */}
            {!isLandingPage && (
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
            )}

            {/* DESKTOP AVATAR / AUTH */}
            <div
              className={cn(
                "hidden md:block transition-opacity",
                isSearchExpanded &&
                  "opacity-0 invisible md:opacity-100 md:visible",
              )}
            >
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "group h-10 px-1.5 flex items-center gap-1.5 rounded-full border transition-all duration-300",
                        isLandingPage
                          ? "border-white/15 hover:border-gold/40 hover:bg-white/5 data-[state=open]:border-gold/50 data-[state=open]:bg-white/5"
                          : "border-border-subtle/70 hover:border-border-subtle hover:bg-card-surface data-[state=open]:border-border-subtle data-[state=open]:bg-card-surface",
                      )}
                    >
                      <Avatar
                        className={cn(
                          "w-8 h-8 transition-transform duration-300 group-hover:scale-105 group-data-[state=open]:scale-105",
                          isLandingPage
                            ? "ring-1 ring-white/20"
                            : "ring-1 ring-border-subtle",
                        )}
                      >
                        <AvatarImage src={user?.avatarImage || ""} />
                        <AvatarFallback className="bg-orange-100 text-orange-900 text-[10px] font-bold">
                          {user?.userName?.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <CaretDownIcon
                        size={14}
                        weight="bold"
                        className="text-ink-muted transition-transform duration-300 group-data-[state=open]:rotate-180"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-72 rounded-xl border border-border-subtle/60 bg-paper/95 dark:bg-card/95 p-2 shadow-2xl backdrop-blur-xl relative overflow-hidden"
                  >
                    {/* Decorative literary artifact glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

                    <DropdownMenuLabel className="p-1 relative z-10">
                      <div className="flex items-center gap-3.5 rounded-lg border border-border-subtle/40 bg-card-surface/40 p-3 transition-colors hover:bg-card-surface/60">
                        <Avatar className="w-11 h-11 ring-1 ring-gold/30 shadow-sm">
                          <AvatarImage src={user?.avatarImage || ""} />
                          <AvatarFallback className="bg-orange-50 text-gold text-lg font-serif italic">
                            {user?.userName?.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-[17px] font-serif font-medium text-ink tracking-tight truncate leading-none">
                            {user?.fullName || user?.userName}
                          </p>
                          <p className="text-xs text-ink-muted truncate font-mono mt-1.5 opacity-90">
                            @{user?.userName}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="my-1.5 bg-border-subtle/50 relative z-10" />

                    <div className="px-1 space-y-0.5 relative z-10">
                      <DropdownMenuItem
                        className="cursor-pointer py-2.5 px-3 gap-3 rounded-md text-ink-muted focus:text-ink focus:bg-gold/10 transition-all duration-200 group"
                        asChild
                      >
                        <Link href={`/${user?.userName}`}>
                          <UserIcon
                            size={18}
                            weight="duotone"
                            className="group-focus:text-gold transition-colors"
                          />
                          <span className="font-medium text-sm">Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer py-2.5 px-3 gap-3 rounded-md text-ink-muted focus:text-ink focus:bg-gold/10 transition-all duration-200 group"
                        asChild
                      >
                        <Link href="/settings">
                          <GearIcon
                            size={18}
                            weight="duotone"
                            className="group-focus:text-gold transition-colors"
                          />
                          <span className="font-medium text-sm">Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="my-1.5 bg-border-subtle/50 relative z-10" />

                    <div className="px-1 relative z-10">
                      <DropdownMenuItem
                        onClick={() => logoutMutation.mutateAsync()}
                        className="cursor-pointer py-2.5 px-3 gap-3 rounded-md text-red-500/80 focus:text-red-600 focus:bg-red-500/10 transition-all duration-200 group"
                      >
                        <SignOutIcon
                          size={18}
                          weight="duotone"
                          className="group-focus:text-red-500 transition-colors"
                        />
                        <span className="font-medium text-sm">Log Out</span>
                      </DropdownMenuItem>
                    </div>

                    {/* Archival library card footer */}
                    <div className="mt-2 pt-2.5 pb-1 border-t border-border-subtle/40 flex justify-between items-center px-3 relative z-10">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted/60 font-mono font-medium">
                        Active Reader
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_rgba(201,169,110,0.6)]" />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-sm font-medium px-4"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      variant="default"
                      className="text-sm font-medium bg-accent text-paper hover:bg-accent-dark px-4"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* MOBILE MENU TRIGGER */}
            <div
              className={cn(
                "md:hidden transition-opacity",
                isSearchExpanded && "opacity-0 invisible",
              )}
            >
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-ink-muted"
                  >
                    <ListIcon size={28} weight="bold" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[85vw] max-w-sm p-0 flex flex-col bg-paper"
                >
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Open the main navigation, account shortcuts, and appearance
                    controls.
                  </SheetDescription>
                  {/* User Card at Top */}
                  <div className="p-6 bg-linear-to-b from-orange-50/50 dark:from-orange-950/10 to-transparent border-b border-border-subtle">
                    {isAuthenticated ? (
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 ring-2 ring-orange-100 dark:ring-orange-900/30">
                          <AvatarImage src={user?.avatarImage || ""} />
                          <AvatarFallback className="bg-orange-100 text-orange-900 font-bold text-xl">
                            {user?.userName?.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-lg font-bold text-ink truncate">
                            {user?.fullName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[10px] font-bold text-orange-700 dark:text-orange-300">
                              @{user?.userName}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-lg font-bold text-ink">
                          Welcome to Recto
                        </p>
                        <div className="flex gap-2">
                          <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1"
                          >
                            <Button variant="ghost" className="w-full">
                              Log In
                            </Button>
                          </Link>
                          <Link
                            href="/signup"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1"
                          >
                            <Button className="w-full bg-accent text-paper">
                              Sign Up
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nav Links */}
                  <div className="flex-1 overflow-y-auto py-4 px-3">
                    <div className="space-y-1">
                      {NavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-4 h-12 text-base font-medium text-ink-muted hover:text-accent hover:bg-orange-50 dark:hover:bg-orange-950/20"
                          >
                            <link.icon
                              size={26}
                              weight="duotone"
                              className="text-accent"
                            />
                            {link.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="p-4 border-t border-border-subtle space-y-2">
                    {!isLandingPage && (
                      <div className="flex items-center justify-between px-2 py-2">
                        <span className="text-sm font-medium text-ink-muted">
                          Appearance
                        </span>
                        <ThemeToggle />
                      </div>
                    )}
                    <Link
                      href="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-4 text-ink-muted"
                      >
                        <GearIcon size={22} />
                        Settings
                      </Button>
                    </Link>
                    {isAuthenticated && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          logoutMutation.mutateAsync();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start gap-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <SignOutIcon size={22} />
                        Log Out
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
