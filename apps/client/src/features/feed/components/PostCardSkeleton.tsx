import { Skeleton } from "@/components/ui/skeleton";

export function PostCardSkeleton() {
  return (
    <article className="flex flex-col p-4 space-y-4 bg-card-surface border border-border-subtle rounded-xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="w-5 h-5 rounded-md" />
      </div>

      {/* Book Block */}
      <div className="flex items-center space-x-4 border border-border-subtle/50 rounded-lg p-3">
        <Skeleton className="w-16 h-24 rounded-md" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center space-x-2 mt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Optional Image (Placeholder is optional, we might just leave a small gap) */}
      <Skeleton className="w-full h-48 rounded-lg" />

      {/* Footer */}
      <div className="flex items-center space-x-4 pt-2">
        <Skeleton className="h-6 w-12 rounded-md" />
        <Skeleton className="h-6 w-12 rounded-md" />
      </div>
    </article>
  );
}
