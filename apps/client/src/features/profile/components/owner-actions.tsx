"use client";

import Link from "next/link";
import { Gear, SignOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type OwnerActionsProps = {
  onLogout: () => void;
  isLoggingOut: boolean;
};

export function OwnerActions({ onLogout, isLoggingOut }: OwnerActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Link href="/profile/update">
        <Button type="button" variant="outline" size="sm">
          Edit profile
        </Button>
      </Link>
      <Link href="/profile/update">
        <Button type="button" variant="ghost" size="icon" aria-label="Settings">
          <Gear size={18} weight="regular" />
        </Button>
      </Link>
      <div className="lg:hidden">
        <ThemeToggle />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="text-red-600 hover:text-red-700 lg:hidden"
      >
        <SignOut size={15} className="mr-1" />
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}
