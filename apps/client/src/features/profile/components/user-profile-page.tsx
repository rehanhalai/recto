"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  DotsThree,
  Gear,
  SignOut,
  UserPlus,
} from "@phosphor-icons/react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { PaginatedResponse, PostWithRelations } from "@recto/types";
import { useInView } from "react-intersection-observer";

import { UserAvatar } from "@/components/UserAvatar";
import { StandardLayout } from "@/components/layout";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/features/feed";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { ApiError, apiInstance } from "@/lib/api";
import { toast } from "@/lib/toast";

type ProfileUser = {
  id: string;
  userName: string;
  fullName: string | null;
  bio: string | null;
  avatarImage: string | null;
  coverImage: string | null;
  followerCount: number;
  followingCount: number;
  role: string;
  createdAt: string;
};

type ProfileContext = {
  isMe: boolean;
  isFollowing: boolean;
};

type ProfilePayload = {
  user: ProfileUser;
  context: ProfileContext;
};

type RelationUser = {
  id: string;
  userName: string;
  fullName: string | null;
  avatarImage: string | null;
};

type TrackerBook = {
  id: string;
  title: string;
  authors: string[];
  coverImage: string | null;
};

type TrackerEntry = {
  id: string;
  status: "wishlist" | "reading" | "finished";
  book: TrackerBook;
};

type PublicList = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  book_count: number;
  covers: string[];
};

type ApiEnvelope<T> = {
  data: T;
  message: string;
};

type UserProfilePageProps = {
  username: string;
};

type RelationMode = "followers" | "following";

type ProfileRelationPage = {
  data: RelationUser[];
  nextCursor: string | null;
  hasMore: boolean;
};

const FALLBACK_COVER =
  "linear-gradient(120deg, rgba(199,162,96,0.28), rgba(114,89,55,0.5))";

async function fetchProfile(username: string): Promise<ProfilePayload> {
  const response = await apiInstance.get<ApiEnvelope<ProfilePayload>>(
    "/user/profile",
    { userName: username },
  );

  return response.data;
}

async function fetchRelationsPage({
  username,
  mode,
  cursor,
}: {
  username: string;
  mode: RelationMode;
  cursor?: string;
}): Promise<ProfileRelationPage> {
  const response = await apiInstance.get<ApiEnvelope<ProfileRelationPage>>(
    `/user/profile/${mode}`,
    { userName: username, limit: 20, cursor },
  );

  return response.data;
}

async function fetchUserPostsPage({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: string;
}): Promise<PaginatedResponse<PostWithRelations>> {
  const response = await apiInstance.get<
    ApiEnvelope<PaginatedResponse<PostWithRelations>>
  >(`/posts/user/${userId}`, { limit: 10, cursor });

  return response.data;
}

async function fetchReadingByStatus(
  userId: string,
  status: "reading" | "finished",
): Promise<TrackerEntry[]> {
  const response = await apiInstance.get<ApiEnvelope<TrackerEntry[]>>(
    `/tracker/user/${userId}`,
    { status },
  );

  return response.data;
}

async function fetchListsForProfile(userId: string): Promise<PublicList[]> {
  const response = await apiInstance.get<ApiEnvelope<PublicList[]>>(
    `/lists/user/${userId}`,
  );

  return response.data;
}

type OwnerActionsProps = {
  onLogout: () => void;
  isLoggingOut: boolean;
};

function OwnerActions({ onLogout, isLoggingOut }: OwnerActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Link href="/profile/update">
        <Button type="button" variant="outline" size="sm">
          Edit profile
        </Button>
      </Link>
      <Link href="/profile/update">
        <Button type="button" variant="ghost" size="icon" aria-label="Settings">
          <Gear size={18} weight="regular" />
        </Button>
      </Link>
      <div className="lg:hidden">
        <ThemeToggle />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="text-red-600 hover:text-red-700 lg:hidden"
      >
        <SignOut size={15} className="mr-1" />
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}

type ViewerActionsProps = {
  isFollowing: boolean;
  isPending: boolean;
  onToggleFollow: () => void;
};

function ViewerActions({
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

function ReadingStrip({
  title,
  books,
  emptyMessage,
  isLoading,
}: {
  title: string;
  books: TrackerEntry[];
  emptyMessage: string;
  isLoading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-2">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink-muted/80">
          {title}
        </h3>
        {books.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              className="p-1 rounded-full hover:bg-card-surface transition-colors text-ink-muted hover:text-ink border border-border-subtle/40"
              aria-label="Scroll left"
            >
              <CaretLeft size={14} weight="bold" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1 rounded-full hover:bg-card-surface transition-colors text-ink-muted hover:text-ink border border-border-subtle/40"
              aria-label="Scroll right"
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden pt-1">
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
        </div>
      ) : books.length === 0 ? (
        <p className="text-sm text-ink-muted italic py-1">{emptyMessage}</p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar select-none scroll-smooth"
        >
          {books.map((entry) => (
            <div
              key={entry.id}
              // href={`/books/${entry.book.}`}
              className="group shrink-0 w-40 space-y-2.5"
            >
              <div className="relative aspect-2/3 w-full overflow-hidden rounded-md border border-border-subtle bg-card-surface/50 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-gold/30">
                {entry.book.coverImage ? (
                  <Image
                    src={entry.book.coverImage}
                    alt={entry.book.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="160px"
                  />
                ) : (
                  <div className="h-full w-full bg-border-subtle/10 flex items-center justify-center p-3">
                    <span className="text-[10px] text-ink-muted/40 uppercase tracking-widest text-center font-bold">
                      {entry.book.title}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-1 text-[0.7rem] font-bold text-ink group-hover:text-gold transition-colors">
                  {entry.book.title}
                </p>
                <p className="line-clamp-1 text-[0.6rem] text-ink-muted uppercase tracking-wider font-medium">
                  {entry.book.authors.join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type RelationshipOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  mode: RelationMode;
};

function RelationshipOverlay({
  open,
  onOpenChange,
  username,
  mode,
}: RelationshipOverlayProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "900px",
  });

  const relationsQuery = useInfiniteQuery<ProfileRelationPage, Error>({
    queryKey: ["profile", username, mode, "modal"],
    queryFn: ({ pageParam }) =>
      fetchRelationsPage({
        username,
        mode,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: open,
  });

  useEffect(() => {
    if (
      inView &&
      relationsQuery.hasNextPage &&
      !relationsQuery.isFetchingNextPage
    ) {
      relationsQuery.fetchNextPage();
    }
  }, [inView, relationsQuery]);

  const users = relationsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const title = mode === "followers" ? "Followers" : "Following";

  const listBody = (
    <div className="space-y-3">
      {relationsQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-ink-muted">No users found.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((person) => (
            <li key={`${mode}-${person.id}`}>
              <Link
                href={`/${person.userName}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-paper/60"
                onClick={() => onOpenChange(false)}
              >
                <UserAvatar
                  src={person.avatarImage}
                  fallbackName={person.fullName ?? person.userName}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {person.fullName ?? person.userName}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    @{person.userName}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {relationsQuery.hasNextPage && (
        <div ref={ref} className="pt-2">
          <Skeleton className="h-10 w-full" />
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[88vh] overflow-y-auto rounded-t-2xl border-border-subtle bg-card-surface text-ink"
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="pt-3">{listBody}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[72vh] max-w-2xl overflow-y-auto border-border-subtle bg-card-surface">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {listBody}
      </DialogContent>
    </Dialog>
  );
}

export function UserProfilePage({ username }: UserProfilePageProps) {
  const authUser = useAuthStore((state) => state.user);
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();
  const [activeTab, setActiveTab] = useState<"posts" | "reading" | "lists">(
    "posts",
  );
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["profile", username],
    queryFn: () => fetchProfile(username),
  });

  const profile = profileQuery.data;
  const targetUserId = profile?.user.id;

  const postsQuery = useInfiniteQuery<
    PaginatedResponse<PostWithRelations>,
    Error
  >({
    queryKey: ["profile", targetUserId, "posts"],
    queryFn: ({ pageParam }) =>
      fetchUserPostsPage({
        userId: targetUserId as string,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(targetUserId && activeTab === "posts"),
  });

  const { ref: postsLoadRef, inView: postsInView } = useInView({
    threshold: 0,
    rootMargin: "1200px",
  });

  useEffect(() => {
    if (
      postsInView &&
      postsQuery.hasNextPage &&
      !postsQuery.isFetchingNextPage
    ) {
      postsQuery.fetchNextPage();
    }
  }, [postsInView, postsQuery]);

  const currentReadingQuery = useQuery({
    queryKey: ["profile", targetUserId, "reading", "current"],
    queryFn: () => fetchReadingByStatus(targetUserId as string, "reading"),
    enabled: Boolean(targetUserId && activeTab === "reading"),
  });

  const completedReadingQuery = useQuery({
    queryKey: ["profile", targetUserId, "reading", "completed"],
    queryFn: () => fetchReadingByStatus(targetUserId as string, "finished"),
    enabled: Boolean(targetUserId && activeTab === "reading"),
  });

  const listsQuery = useQuery({
    queryKey: ["profile", targetUserId, "lists"],
    queryFn: () => fetchListsForProfile(targetUserId as string),
    enabled: Boolean(targetUserId && activeTab === "lists"),
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!profile) {
        throw new Error("Profile is not loaded yet.");
      }

      const targetId = profile.user.id;
      const shouldUnfollow = profile.context.isFollowing;

      if (shouldUnfollow) {
        await apiInstance.delete(`/user/follow/${targetId}`);
      } else {
        await apiInstance.post(`/user/follow/${targetId}`);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile", username] }),
        queryClient.invalidateQueries({
          queryKey: ["profile", username, "followers", "modal"],
        }),
      ]);
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Could not update follow state.";
      toast.error(message);
    },
  });

  const posts = postsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  const headerMode: "owner" | "viewer" = profile?.context.isMe
    ? "owner"
    : "viewer";

  const canToggleFollow =
    profile &&
    !profile.context.isMe &&
    Boolean(authUser?.id && authUser.id !== profile.user.id);

  const profileDisplayName = useMemo(() => {
    if (!profile) {
      return "";
    }

    return profile.user.fullName || profile.user.userName;
  }, [profile]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      router.push("/login");
    }
  };

  if (profileQuery.isLoading) {
    return (
      <StandardLayout
        leftSidebar={<SidebarLeft />}
        rightSidebar={<SidebarRight />}
      >
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-52 w-full" />
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
        <div className="rounded-xl border border-border-subtle bg-card-surface p-6 text-center">
          <h1 className="text-xl font-semibold text-ink">Profile not found</h1>
          <p className="mt-1 text-sm text-ink-muted">
            We could not find that user profile.
          </p>
          <Link href="/feed" className="mt-4 inline-flex">
            <Button type="button" variant="outline">
              Back to feed
            </Button>
          </Link>
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout
      leftSidebar={<SidebarLeft />}
      rightSidebar={<SidebarRight />}
    >
      <RelationshipOverlay
        open={followersOpen}
        onOpenChange={setFollowersOpen}
        username={username}
        mode="followers"
      />
      <RelationshipOverlay
        open={followingOpen}
        onOpenChange={setFollowingOpen}
        username={username}
        mode="following"
      />

      <div className="space-y-5">
        <section className="overflow-hidden rounded-2xl border border-border-subtle bg-card-surface">
          <div
            className="relative h-40 w-full bg-paper"
            style={{ background: FALLBACK_COVER }}
          >
            {profile.user.coverImage ? (
              <Image
                src={profile.user.coverImage}
                alt={`${profile.user.userName} cover image`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 900px"
                priority
              />
            ) : null}
          </div>

          <div className="px-5 pb-5 pt-3 sm:pt-4">
            <div className="-mt-7 sm:-mt-8 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-3 min-w-0">
                <UserAvatar
                  src={profile.user.avatarImage}
                  fallbackName={profileDisplayName}
                  className="h-20 w-20 border-2 border-paper"
                />

                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-tight text-ink truncate">
                    {profileDisplayName}
                  </h1>
                  <p className="text-sm text-ink-muted truncate">
                    @{profile.user.userName}
                  </p>
                </div>
              </div>

              {headerMode === "owner" ? (
                <OwnerActions
                  onLogout={handleLogout}
                  isLoggingOut={logoutMutation.isPending}
                />
              ) : (
                <ViewerActions
                  isFollowing={profile.context.isFollowing}
                  isPending={followMutation.isPending}
                  onToggleFollow={() => {
                    if (!canToggleFollow) {
                      toast.error("Please log in to follow users.");
                      return;
                    }
                    followMutation.mutate();
                  }}
                />
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              {profile.user.bio || "This reader has not added a bio yet."}
            </p>

            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <button
                type="button"
                onClick={() => setFollowersOpen(true)}
                className="text-ink transition-colors hover:text-accent"
              >
                <strong className="font-semibold">
                  {profile.user.followerCount}
                </strong>{" "}
                followers
              </button>
              <button
                type="button"
                onClick={() => setFollowingOpen(true)}
                className="text-ink transition-colors hover:text-accent"
              >
                <strong className="font-semibold">
                  {profile.user.followingCount}
                </strong>{" "}
                following
              </button>
              <span className="text-ink-muted">
                Joined {new Date(profile.user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </section>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "posts" | "reading" | "lists")
          }
          className="space-y-4"
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="lists">Book lists</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-3">
            {postsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : posts.length === 0 ? (
              <section className="rounded-xl border border-border-subtle bg-card-surface p-5 text-sm text-ink-muted">
                No posts yet.
              </section>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {postsQuery.hasNextPage && (
                  <div ref={postsLoadRef} className="pt-2">
                    <Skeleton className="h-24 w-full" />
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="reading" className="space-y-4">
            <ReadingStrip
              title="Currently reading"
              books={currentReadingQuery.data ?? []}
              isLoading={currentReadingQuery.isLoading}
              emptyMessage="No current reads to show."
            />
            <ReadingStrip
              title="Completed"
              books={completedReadingQuery.data ?? []}
              isLoading={completedReadingQuery.isLoading}
              emptyMessage="No completed books yet."
            />
          </TabsContent>

          <TabsContent value="lists">
            <section className="rounded-xl border border-border-subtle bg-card-surface p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Book lists
              </h3>

              {listsQuery.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (listsQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-ink-muted">No lists available.</p>
              ) : (
                <ul className="space-y-3">
                  {(listsQuery.data ?? []).map((list) => (
                    <li
                      key={list.id}
                      className="rounded-lg border border-border-subtle bg-paper/50 p-3"
                    >
                      {/* <Link href={`/list/${list.id}`}> */}
                      <p className="text-sm font-semibold text-ink">
                        {list.name}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {list.book_count} books
                      </p>
                      {/* </Link> */}
                      {list.description ? (
                        <p className="mt-1 text-sm text-ink-muted">
                          {list.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </StandardLayout>
  );
}
