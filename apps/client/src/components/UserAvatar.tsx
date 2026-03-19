import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  src?: string | null;
  fallbackName?: string;
  className?: string;
};

export function UserAvatar({ src, fallbackName, className }: UserAvatarProps) {
  const words = fallbackName?.trim().split(" ") || [];
  let initials = "??";
  if (words.length > 0) {
    initials =
      words.length > 1
        ? (words[0][0] + words[1][0]).toUpperCase()
        : words[0].substring(0, 2).toUpperCase();
  }

  return (
    <Avatar className={cn("w-9 h-9", className)}>
      {src && <AvatarImage src={src} className="object-cover" />}
      <AvatarFallback className="bg-gold/20 text-gold font-medium text-sm">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
