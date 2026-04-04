"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { PaginatedResponse, PostWithRelations } from "@recto/types";
import { StandardLayout } from "@/components/layout";
import { FeedTabs } from "@/features/feed/components/feed-tabs";
import { ExploreFeed } from "@/features/feed/components/explore-feed";
import { FeedPostsSkeleton } from "@/features/feed/components/feed-skeletons";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";

const FollowingFeed = dynamic(
  () =>
    import("@/features/feed/components/following-feed").then(
      (mod) => mod.FollowingFeed,
    ),
  {
    loading: () => <FeedPostsSkeleton count={3} />,
  },
);

type FeedPageClientProps = {
  initialPosts: PaginatedResponse<PostWithRelations>;
};

export function FeedPageClient({ initialPosts }: FeedPageClientProps) {
  const [activeTab, setActiveTab] = useState<"explore" | "following">(
    "explore",
  );

  return (
    <StandardLayout
      leftSidebar={<SidebarLeft />}
      rightSidebar={<SidebarRight />}
    >
      <div className="flex flex-col gap-3">
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "explore" ? (
          <ExploreFeed initialData={initialPosts} />
        ) : (
          <FollowingFeed enabled={activeTab === "following"} />
        )}
      </div>
    </StandardLayout>
  );
}
