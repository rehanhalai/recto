"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchOverview } from "./search-overview";
import { SearchBooksTab } from "./search-books-tab";
import { SearchUsersTab } from "./search-users-tab";
import { SearchListsTab } from "./search-lists-tab";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Suspense, useState, useEffect } from "react";
import { Input, Button } from "@/components/ui";
import { TrendingBooksStrip } from "@/features/book/components/book-strips/TrendingBooksStrip";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const currentTab = searchParams.get("tab") || "all";

  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSearch = () => {
    const trimmed = localQuery.trim();
    if (trimmed.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else if (trimmed.length === 0) {
      router.push(`/search`);
    }
  };

  const handleTabChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", val);
    router.push(`/search?${newParams.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 animate-in fade-in duration-500 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-ink flex items-center gap-3 mb-6">
          <MagnifyingGlassIcon className="text-gold" weight="bold" />
          Explore Recto
        </h1>

        <div className="flex gap-2 max-w-2xl">
          <Input
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search users, books, lists..."
            className="flex-1 bg-card-surface border-border-subtle focus-visible:ring-accent md:text-base h-11"
          />
          <Button
            onClick={handleSearch}
            disabled={localQuery.trim().length === 1}
            className="bg-accent text-paper hover:bg-accent-dark h-11 px-6"
          >
            Search
          </Button>
        </div>
        {localQuery.trim().length === 1 && (
          <p className="text-xs text-ink-muted/60 mt-2 ml-1">
            Type at least 2 characters to search
          </p>
        )}
      </div>

      {!query ? (
        <div className="mt-12 space-y-12 animate-in slide-in-from-bottom-4 fade-in duration-700 pb-20">
          <section>
            <h2 className="text-2xl font-serif font-bold text-ink mb-2">
              General Discovery
            </h2>
            <p className="text-ink-muted mb-8 text-sm md:text-base">
              Start typing above to search the whole platform, or browse our
              latest trending books below.
            </p>
            <TrendingBooksStrip />
          </section>
        </div>
      ) : (
        <>
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className="mb-20"
          >
            <TabsList className="mb-6 grid w-full grid-cols-4 max-w-2xl bg-card-surface/50 border border-border-subtle p-1 rounded-xl">
              <TabsTrigger
                value="all"
                className="rounded-lg data-[state=active]:bg-gold/10 data-[state=active]:text-gold transition-all"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="books"
                className="rounded-lg data-[state=active]:bg-gold/10 data-[state=active]:text-gold transition-all"
              >
                Books
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-lg data-[state=active]:bg-gold/10 data-[state=active]:text-gold transition-all"
              >
                Users
              </TabsTrigger>
              <TabsTrigger
                value="lists"
                className="rounded-lg data-[state=active]:bg-gold/10 data-[state=active]:text-gold transition-all"
              >
                Lists
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="all"
              className="mt-6 focus-visible:outline-none focus-visible:ring-0"
            >
              <SearchOverview query={query} onTabChange={handleTabChange} />
            </TabsContent>
            <TabsContent
              value="books"
              className="mt-6 focus-visible:outline-none focus-visible:ring-0"
            >
              <SearchBooksTab query={query} />
            </TabsContent>
            <TabsContent
              value="users"
              className="mt-6 focus-visible:outline-none focus-visible:ring-0"
            >
              <SearchUsersTab query={query} />
            </TabsContent>
            <TabsContent
              value="lists"
              className="mt-6 focus-visible:outline-none focus-visible:ring-0"
            >
              <SearchListsTab query={query} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export function SearchResultsLayout() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-ink-muted animate-pulse">
          Loading search...
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
