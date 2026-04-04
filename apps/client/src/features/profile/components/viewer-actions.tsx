"use client";

import { DotsThree, UserPlus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type ViewerActionsProps = {
  isFollowing: boolean;
  isPending: boolean;
  onToggleFollow: () => void;
};

export function ViewerActions({
  isFollowing,
  isPending,
  onToggleFollow,
}: ViewerActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant={isFollowing ? "outline" : "default"}
        onClick={onToggleFollow}
        disabled={isPending}
      >
        <UserPlus size={16} weight="bold" />
        {isPending ? "Updating" : isFollowing ? "Following" : "Follow"}
      </Button>
      <Button type="button" variant="ghost" size="icon" aria-label="More">
        <DotsThree size={20} weight="bold" />
      </Button>
    </div>
  );
}
