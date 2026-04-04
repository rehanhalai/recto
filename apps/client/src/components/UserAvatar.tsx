"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  src?: string | null;
  fallbackName?: string;
  className?: string;
};

export function UserAvatar({ src, fallbackName, className }: UserAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [src]);

  const words = fallbackName?.trim().split(" ") || [];
  let initials = "??";
  if (words.length > 0) {
    initials =
      words.length > 1
        ? (words[0][0] + words[1][0]).toUpperCase()
        : words[0].substring(0, 2).toUpperCase();
  }

  return (
    <div
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
    >
      {src && !hasImageError ? (
        <Image
          src={src}
          alt={fallbackName ? `${fallbackName} avatar` : "User avatar"}
          fill
          className="object-cover"
          sizes="36px"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gold/20 text-sm font-medium text-gold">
          {initials}
        </div>
      )}
    </div>
  );
}
