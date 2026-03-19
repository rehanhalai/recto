"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  BookmarkIcon,
  PencilSimpleIcon,
  GearIcon,
  UserIcon,
  SignOutIcon,
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
  SheetHeader,
  SheetTitle,
  Separator,
} from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { LibraryIcon, Menu } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useTheme } from "next-themes";
import rectoIcon from "@recto/assets/logos/recto-icon.webp";
import rectoIconGold from "@recto/assets/logos/recto-icon-gold.webp";
import rectoLogoDark from "@recto/assets/logos/recto-logo-dark.webp";
import rectoLogoLight from "@recto/assets/logos/recto-logo-light.webp";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, systemTheme } = useTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkMode = currentTheme === "dark";

  return (
    <nav className="sticky top-0 z-50 bg-paper dark:bg-card md:backdrop-blur border-b border-border-subtle dark:border-border-subtle shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile: Hamburger + Logo + Search Icon */}
          <div className="flex items-center gap-4 md:hidden w-full">
            {/* Hamburger Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-ink dark:text-ink hover:bg-paper/50 dark:hover:bg-card/50"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 flex flex-col bg-paper dark:bg-paper border-r border-border-subtle dark:border-border-subtle p-0"
              >
                {/* Header: User Profile */}
                <div className="bg-linear-to-b from-orange-50 to-transparent dark:from-orange-950/20 dark:to-transparent border-b border-border-subtle dark:border-border-subtle p-6">
                  {isAuthenticated ? (
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16 ring-2 ring-orange-200 dark:ring-orange-900">
                        <AvatarImage
                          src={
                            user?.avatarImage || "https://github.com/shadcn.png"
                          }
                        />
                        <AvatarFallback className="bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100">
                          {user?.userName.slice(0, 1).toUpperCase() || "JD"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <SheetTitle className="text-lg font-bold text-ink dark:text-ink tracking-tight">
                          {user?.userName || "John Doe"}
                        </SheetTitle>
                        <p className="text-sm text-ink-muted dark:text-ink-muted">
                          Book lover & avid reader
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <Link href="/login" className="w-full">
                        <Button
                          variant="ghost"
                          className="w-full text-sm font-medium text-ink dark:text-ink hover:bg-paper/50 dark:hover:bg-card/50"
                        >
                          Log In
                        </Button>
                      </Link>
                      <Link href="/signup" className="w-full">
                        <Button
                          variant="default"
                          className="w-full text-sm font-medium bg-accent dark:bg-accent text-paper dark:text-paper hover:bg-accent-dark dark:hover:bg-accent-dark"
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Body: Navigation Links */}
                <div className="flex flex-col flex-1 gap-1 px-4 py-6 overflow-y-auto">
                  <Button
                    variant="ghost"
                    className="justify-start text-ink dark:text-ink hover:bg-paper/50 dark:hover:bg-card/50 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BookmarkIcon className="w-5 h-5 mr-3 text-orange-600 dark:text-orange-500" />
                    Readings
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-ink dark:text-ink hover:bg-paper/50 dark:hover:bg-card/50 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 mr-3 text-orange-600 dark:text-orange-500" />
                    Browse Books
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-ink dark:text-ink hover:bg-paper/50 dark:hover:bg-card/50 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LibraryIcon className="w-5 h-5 mr-3 text-orange-600 dark:text-orange-500" />
                    Lists
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-ink dark:text-ink hover:bg-paper/50 dark:hover:bg-card/50 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PencilSimpleIcon className="w-5 h-5 mr-3 text-orange-600 dark:text-orange-500" />
                    Blogs
                  </Button>
                </div>

                {/* Footer: Settings Button */}
                <div className="border-t border-border-subtle dark:border-border-subtle p-4">
                  <Button
                    variant="ghost"
                    className="justify-start w-full text-ink dark:text-ink hover:bg-paper/50 dark:hover:bg-card/50 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <GearIcon className="w-5 h-5 mr-3 text-orange-600 dark:text-orange-500" />
                    Settings
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo (Center on Mobile) */}
            <Link
              href="/home"
              className="group flex items-center gap-3 select-none outline-none focus-visible:ring-2 focus-visible:ring-gold p-1"
            >
              <Image
                src={isDarkMode ? rectoLogoLight : rectoLogoDark}
                alt="Recto"
                priority
                loading="eager"
                width={100}
                height={100}
                className=" transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
              />
            </Link>

            {/* Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-ink dark:text-ink hover:bg-paper/50 dark:hover:bg-card/50"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Desktop: Logo + Center Nav + Profile */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Left: Logo */}
            <Link
              href="/home"
              className="flex items-center gap-2 font-bold text-xl text-ink dark:text-ink tracking-tight"
            >
              <Image
                src={isDarkMode ? rectoLogoLight : rectoLogoDark}
                alt="Recto Logo"
                priority
                width={124}
                height={37}
              />
            </Link>

            {/* Center: Nav Links + Search */}
            <div className="flex items-center gap-6">
              <Link
                href="/browse"
                className="text-sm font-medium text-ink-muted dark:text-ink-muted hover:text-accent-dark dark:hover:text-accent transition-colors"
              >
                Browse
              </Link>
              <Link
                href="/lists"
                className="text-sm font-medium text-ink-muted dark:text-ink-muted hover:text-accent-dark dark:hover:text-accent transition-colors"
              >
                Lists
              </Link>
              <Link
                href="/blogs"
                className="text-sm font-medium text-ink-muted dark:text-ink-muted hover:text-accent-dark dark:hover:text-accent transition-colors"
              >
                Blogs
              </Link>

              {/* Search Bar */}
              <div className="relative w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted dark:text-ink-muted" />
                <Input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card-surface dark:bg-card-surface border-border-subtle dark:border-border-subtle text-ink dark:text-ink placeholder:text-ink-muted dark:placeholder:text-ink-muted"
                />
              </div>
            </div>

            {/* Right: Theme Toggle & Profile */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 h-auto py-2 text-ink dark:text-ink hover:bg-paper/50 dark:hover:bg-card/50"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={
                            user?.avatarImage || "https://github.com/shadcn.png"
                          }
                        />
                        <AvatarFallback className="bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 text-xs">
                          {user?.userName?.slice(0, 1).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {user?.userName || "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-paper dark:bg-card border-border-subtle dark:border-border-subtle"
                  >
                    <DropdownMenuLabel className="text-ink dark:text-ink">
                      My Account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-ink dark:text-ink focus:bg-paper/50 dark:focus:bg-card/50 cursor-pointer">
                      <UserIcon className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-500" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-ink dark:text-ink focus:bg-paper/50 dark:focus:bg-card/50 cursor-pointer">
                      <GearIcon className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-500" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="text-accent-dark dark:text-accent focus:bg-paper/50 dark:focus:bg-card/50 cursor-pointer"
                    >
                      <SignOutIcon className="w-4 h-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-sm font-medium text-ink dark:text-ink hover:bg-paper/50 dark:hover:bg-card/50"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      variant="default"
                      className="text-sm font-medium bg-accent dark:bg-accent text-paper dark:text-paper hover:bg-accent-dark dark:hover:bg-accent-dark"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
