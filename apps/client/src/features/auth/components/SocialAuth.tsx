"use client";

import { Button, Separator } from "@/components/ui";
import { GoogleLogoIcon } from "@phosphor-icons/react";
import { getGoogleAuthUrl } from "../services/auth-api";

interface SocialAuthProps {
  actionText: string;
}

export function SocialAuth({ actionText }: SocialAuthProps) {
  const handleGoogleClick = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleClick}
        className="flex w-full items-center justify-center space-x-2 py-2.5 border border-input hover:bg-muted"
        size="lg"
      >
        <GoogleLogoIcon
          size={22}
          weight="bold"
          className="text-black dark:text-white"
        />
        <span className="text-sm font-medium">{actionText}</span>
      </Button>
    </>
  );
}
