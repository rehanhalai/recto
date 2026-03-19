"use client";

import { FeedClient } from "./FeedClient";
import { FeedSection } from "./FeedSection";
import { HeroStrip } from "./HeroStrip";
import { useCurrentRead } from "../hooks/useCurrentRead";

export function FeedHome() {
  const { data: currentRead } = useCurrentRead();

  return (
    <div className="space-y-8">
      <HeroStrip currentRead={currentRead ?? null} />

      <FeedClient />

      <FeedSection title="Trending Books" href="/books">
        <div className="w-full h-32 md:w-full md:h-full bg-border-subtle/10 rounded-lg flex items-center justify-center border border-border-subtle p-4">
          <span className="text-sm text-ink-muted">
            Trending list placeholder
          </span>
        </div>
        <div className="w-full h-32 md:w-full md:h-full bg-border-subtle/10 rounded-lg flex items-center justify-center border border-border-subtle p-4">
          <span className="text-sm text-ink-muted">
            Trending list placeholder
          </span>
        </div>
        <div className="w-full h-32 md:w-full md:h-full bg-border-subtle/10 rounded-lg flex items-center justify-center border border-border-subtle p-4">
          <span className="text-sm text-ink-muted">
            Trending list placeholder
          </span>
        </div>
      </FeedSection>

      <FeedSection title="Popular Lists" href="/lists">
        <div className="w-full h-24 md:w-full md:h-full bg-border-subtle/10 rounded-lg flex items-center justify-center border border-border-subtle p-4">
          <span className="text-sm text-ink-muted">
            Popular lists placeholder
          </span>
        </div>
        <div className="w-full h-24 md:w-full md:h-full bg-border-subtle/10 rounded-lg flex items-center justify-center border border-border-subtle p-4">
          <span className="text-sm text-ink-muted">
            Popular lists placeholder
          </span>
        </div>
        <div className="w-full h-24 md:w-full md:h-full bg-border-subtle/10 rounded-lg flex items-center justify-center border border-border-subtle p-4">
          <span className="text-sm text-ink-muted">
            Popular lists placeholder
          </span>
        </div>
      </FeedSection>
    </div>
  );
}
