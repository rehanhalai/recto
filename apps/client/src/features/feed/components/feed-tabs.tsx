"use client";

import { cn } from "@/lib/utils";

type FeedTabsProps = {
  activeTab: "explore" | "following";
  onTabChange: (tab: "explore" | "following") => void;
};

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex w-full rounded-xl bg-card-surface border border-border-subtle p-1">
      <button
        onClick={() => onTabChange("following")}
        className={cn(
          "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200",
          activeTab === "following"
            ? "bg-accent text-paper shadow-sm"
            : "text-ink-muted hover:text-ink",
        )}
      >
        Following
      </button>
      <button
        onClick={() => onTabChange("explore")}
        className={cn(
          "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200",
          activeTab === "explore"
            ? "bg-accent text-paper shadow-sm"
            : "text-ink-muted hover:text-ink",
        )}
      >
        Explore
      </button>
    </div>
  );
}
