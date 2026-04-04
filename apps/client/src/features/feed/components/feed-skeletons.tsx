import { StandardLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";

type FeedPostsSkeletonProps = {
  count?: number;
};

export function FeedTabsSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-card-surface p-1">
      <Skeleton className="h-8 flex-1 rounded-md" />
      <Skeleton className="h-8 flex-1 rounded-md" />
    </div>
  );
}

export function FeedPostsSkeleton({ count = 3 }: FeedPostsSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="rounded-xl border border-border-subtle bg-card-surface p-4 md:p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-9/12" />
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function FeedPageSkeleton() {
  return (
    <StandardLayout
      leftSidebar={<SidebarLeft />}
      rightSidebar={<SidebarRight />}
    >
      <div className="flex flex-col gap-3">
        <FeedTabsSkeleton />
        <FeedPostsSkeleton count={3} />
      </div>
    </StandardLayout>
  );
}
