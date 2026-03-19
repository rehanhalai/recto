"use client";

import { useState } from "react";
import type { PostWithRelations, PaginatedResponse } from "@recto/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { TrendingBooksStrip } from "@/features/book/components/TrendingBooksStrip";
import { FeedClient } from "./FeedClient";
import { FeedSection } from "./FeedSection";
import { HeroStrip } from "./HeroStrip";
import { useCurrentRead } from "../hooks/useCurrentRead";
import type { FeedType } from "../hooks/useFeed";

interface FeedHomeProps {
  initialPosts: PaginatedResponse<PostWithRelations>;
}

export function FeedHome({ initialPosts }: FeedHomeProps) {
  const { data: currentRead } = useCurrentRead();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedType>("explore");

  return (
    <div className="space-y-8">
      <HeroStrip currentRead={currentRead ?? null} />

      <div className="flex flex-col gap-6">
        {isAuthenticated && (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as FeedType)}
            className="w-full flex justify-center"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="explore">Explore</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <FeedClient type={activeTab} initialData={initialPosts} />
      </div>

      <TrendingBooksStrip />

      <FeedSection title="Popular Lists" href="/lists">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full h-24 bg-card-surface/50 rounded-xl flex items-center justify-center border border-border-subtle p-6 group cursor-not-allowed">
            <span className="text-sm text-ink-muted italic group-hover:text-ink transition-colors">
              Coming soon: Curated collections of must-reads...
            </span>
          </div>
        </div>
      </FeedSection>
    </div>
  );
}
