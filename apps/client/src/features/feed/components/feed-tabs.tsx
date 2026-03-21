"use client";

import { cn } from "@/lib/utils";

type FeedTabsProps = {
  activeTab: "explore" | "following";
  onTabChange: (tab: "explore" | "following") => void;
};

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex w-full border-b border-border-subtle/40 bg-paper sticky top-0 z-20 -mt-4 ">
      <button
        onClick={() => onTabChange("explore")}
        className="relative flex-1 flex justify-center hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="relative flex flex-col justify-center h-13">
          <span
            className={cn(
              "text-[15px] transition-colors",
              activeTab === "explore"
                ? "text-ink font-bold"
                : "text-ink-muted font-medium",
            )}
          >
            For you
          </span>
          {activeTab === "explore" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />
          )}
        </div>
      </button>
      <button
        onClick={() => onTabChange("following")}
        className="relative flex-1 flex justify-center hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="relative flex flex-col justify-center h-13">
          <span
            className={cn(
              "text-[15px] transition-colors",
              activeTab === "following"
                ? "text-ink font-bold"
                : "text-ink-muted font-medium",
            )}
          >
            Following
          </span>
          {activeTab === "following" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />
          )}
        </div>
      </button>
    </div>
  );
}
