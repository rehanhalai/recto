import { StandardLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";

export function ProfileHeaderSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full" />

      <div className="space-y-6 px-1">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between -mt-16 relative z-10">
          <div className="flex gap-4">
            <Skeleton className="h-28 w-28 rounded-full border border-border-subtle" />
            <div className="flex flex-col justify-end gap-2 pb-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="flex gap-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 border-b border-border-subtle pb-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfilePostsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function ProfileListsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export function ProfileReadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <div className="flex gap-4 overflow-hidden pt-1">
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <div className="flex gap-4 overflow-hidden pt-1">
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <StandardLayout
      leftSidebar={<SidebarLeft />}
      rightSidebar={<SidebarRight />}
    >
      <ProfileHeaderSkeleton />
      <div className="px-1 pt-2">
        <ProfilePostsSkeleton />
      </div>
    </StandardLayout>
  );
}
