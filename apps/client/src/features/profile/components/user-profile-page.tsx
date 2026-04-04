"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { UserAvatar } from "@/components/UserAvatar";
import { StandardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/features/feed";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";
import { useFollowUser } from "../hooks/use-follow-user";
import { useProfile } from "../hooks/use-profile";
import { useUserPosts } from "../hooks/use-user-posts";
import { useReadingStatus } from "../hooks/use-reading-status";
import { useUserLists } from "../hooks/use-user-lists";
import { ReadingStrip } from "./reading-strip";
import { RelationshipOverlay } from "./relationship-overlay";
import { OwnerActions } from "./owner-actions";
import { ViewerActions } from "./viewer-actions";
import { ListCoverGrid } from "./list-cover-grid";

type UserProfilePageProps = {
  username: string;
};

type ProfileTab = "posts" | "reading" | "lists";

const FALLBACK_COVER =
  "linear-gradient(120deg, rgba(199,162,96,0.28), rgba(114,89,55,0.5))";

export function UserProfilePage({ username }: UserProfilePageProps) {
  const router = useRouter();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [relationshipOverlay, setRelationshipOverlay] = useState<
    "followers" | "following" | null
  >(null);

  // Fetch profile data
  const profileQuery = useProfile(username);
  const profile = profileQuery.data;
  const isMe = profile?.context?.isMe ?? false;
  const userId = profile?.user?.id;

  // Fetch data based on active tab
  const postsQuery = useUserPosts(userId, activeTab === "posts");
  const currentReadingQuery = useReadingStatus(
    userId,
    "reading",
    activeTab === "reading",
  );
  const completedReadingQuery = useReadingStatus(
    userId,
    "finished",
    activeTab === "reading",
  );
  const listsQuery = useUserLists(userId, activeTab === "lists");
  const followMutation = useFollowUser(username, userId);

  if (profileQuery.isLoading) {
    return (
      <StandardLayout
        leftSidebar={<SidebarLeft />}
        rightSidebar={<SidebarRight />}
      >
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </StandardLayout>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <StandardLayout
        leftSidebar={<SidebarLeft />}
        rightSidebar={<SidebarRight />}
      >
        <div className="text-center py-12">
          <p className="text-ink-muted">User not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="mt-4"
          >
            Go Home
          </Button>
        </div>
      </StandardLayout>
    );
  }

  const { user } = profile;

  return (
    <StandardLayout
      leftSidebar={<SidebarLeft />}
      rightSidebar={<SidebarRight />}
    >
      {/* Cover section */}
      <div
        className="relative -mx-safe h-48 w-full overflow-hidden"
        style={!user.coverImage ? { background: FALLBACK_COVER } : undefined}
      >
        {user.coverImage ? (
          <Image
            src={user.coverImage}
            alt={`${user.userName} cover image`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-paper/80 to-paper" />
      </div>

      {/* Profile info section */}
      <div className="space-y-6 px-1">
        {/* Avatar and basic info */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 relative z-10">
          <div className="flex gap-4">
            <UserAvatar
              src={user.avatarImage}
              fallbackName={user.fullName ?? user.userName}
              className="h-28 w-28 border border-grey-subtle bg-card-surface/50 shadow-sm"
            />
            <div className="flex flex-col justify-end pb-1">
              <h1 className="text-3xl font-bold text-ink">
                {user.fullName ?? user.userName}
              </h1>
              <p className="text-ink-muted">@{user.userName}</p>
              {user.bio && <p className="text-sm text-ink mt-2">{user.bio}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isMe ? (
              <OwnerActions
                onLogout={() => logout()}
                isLoggingOut={isLoggingOut}
              />
            ) : (
              <ViewerActions
                isFollowing={profile.context.isFollowing}
                isPending={followMutation.isPending}
                onToggleFollow={() =>
                  followMutation.mutate(!profile.context.isFollowing)
                }
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm">
          <button
            onClick={() => setRelationshipOverlay("followers")}
            className="hover:text-gold transition-colors"
          >
            <span className="font-bold text-ink">{user.followerCount}</span>
            <span className="text-ink-muted"> followers</span>
          </button>
          <button
            onClick={() => setRelationshipOverlay("following")}
            className="hover:text-gold transition-colors"
          >
            <span className="font-bold text-ink">{user.followingCount}</span>
            <span className="text-ink-muted"> following</span>
          </button>
          <div>
            <span className="font-bold text-ink">
              {new Date(user.createdAt).getFullYear()}
            </span>
            <span className="text-ink-muted"> joined</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ProfileTab)}
        >
          <TabsList className="w-full justify-start border-b border-border-subtle bg-transparent p-0 h-auto rounded-none">
            <TabsTrigger
              value="posts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="reading"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent"
            >
              Reading
            </TabsTrigger>
            <TabsTrigger
              value="lists"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent"
            >
              Lists
            </TabsTrigger>
          </TabsList>

          {/* Posts tab */}
          <TabsContent value="posts" className="space-y-4">
            {postsQuery.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : postsQuery.data?.pages[0]?.data?.length === 0 ? (
              <p className="text-center text-ink-muted py-8">No posts yet</p>
            ) : (
              <div className="space-y-4">
                {postsQuery.data?.pages.map((page) =>
                  page.data.map((post) => (
                    <PostCard key={post.id} post={post} />
                  )),
                )}
                {postsQuery.hasNextPage && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => postsQuery.fetchNextPage()}
                    disabled={postsQuery.isFetchingNextPage}
                  >
                    {postsQuery.isFetchingNextPage ? "Loading..." : "Load more"}
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Reading tab */}
          <TabsContent value="reading" className="space-y-6">
            <ReadingStrip
              title="Currently Reading"
              books={currentReadingQuery.data ?? []}
              emptyMessage="No books currently being read"
              isLoading={currentReadingQuery.isLoading}
            />
            <ReadingStrip
              title="Completed"
              books={completedReadingQuery.data ?? []}
              emptyMessage="No completed books"
              isLoading={completedReadingQuery.isLoading}
            />
          </TabsContent>

          {/* Lists tab */}
          <TabsContent value="lists" className="grid grid-cols-1 gap-4">
            {listsQuery.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : listsQuery.data && listsQuery.data.length > 0 ? (
              listsQuery.data.map((list) => (
                <Link
                  key={list.id}
                  href={`/${user.userName}/lists/${list.id}`}
                  className="flex gap-4 items-start rounded-lg border border-border-subtle p-4 transition-all hover:bg-paper/60 hover:border-gold/30"
                >
                  <ListCoverGrid covers={list.covers ?? []} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink">{list.name}</h3>
                    {list.description && (
                      <p className="text-sm text-ink-muted line-clamp-2">
                        {list.description}
                      </p>
                    )}
                    <p className="text-xs text-ink-muted/60 mt-2">
                      {list.book_count} book
                      {list.book_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-ink-muted py-8">No lists yet</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Relationship overlay modals */}
      <RelationshipOverlay
        open={relationshipOverlay === "followers"}
        onOpenChange={(open) =>
          setRelationshipOverlay(open ? "followers" : null)
        }
        username={username}
        mode="followers"
      />
      <RelationshipOverlay
        open={relationshipOverlay === "following"}
        onOpenChange={(open) =>
          setRelationshipOverlay(open ? "following" : null)
        }
        username={username}
        mode="following"
      />
    </StandardLayout>
  );
}
