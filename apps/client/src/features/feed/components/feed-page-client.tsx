"use client";

import { useState } from "react";
import type { PaginatedResponse, PostWithRelations } from "@recto/types";
import { FeedLayout } from "@/features/feed/components/feed-layout";
import { FeedTabs } from "@/features/feed/components/feed-tabs";
import { ExploreFeed } from "@/features/feed/components/explore-feed";
import { FollowingFeed } from "@/features/feed/components/following-feed";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";

type FeedPageClientProps = {
  initialPosts: PaginatedResponse<PostWithRelations>;
};

export function FeedPageClient({ initialPosts }: FeedPageClientProps) {
  const [activeTab, setActiveTab] = useState<"explore" | "following">(
    "explore",
  );

  return (
    <FeedLayout leftSidebar={<SidebarLeft />} rightPanel={<SidebarRight />}>
      <div className="flex flex-col gap-3">
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "explore" ? (
          <ExploreFeed initialData={initialPosts} />
        ) : (
          <FollowingFeed enabled={activeTab === "following"} />
        )}
      </div>
    </FeedLayout>
  );
}
