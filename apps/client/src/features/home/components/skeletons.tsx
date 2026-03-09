// Skeleton loader component for book cards
export const BookCardSkeleton = () => (
  <div className="bg-card-surface dark:bg-card-surface/50 rounded-xl overflow-hidden h-full">
    <div className="aspect-2/3 bg-border-subtle dark:bg-border-subtle/40 rounded-xl m-3 animate-pulse" />
    <div className="px-4 pb-4 space-y-2">
      <div className="h-4 bg-border-subtle dark:bg-border-subtle/40 rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-border-subtle dark:bg-border-subtle/40 rounded w-1/2 animate-pulse" />
    </div>
  </div>
);

// Skeleton loader component for lists/blogs
export const ListCardSkeleton = () => (
  <div className="bg-card-surface dark:bg-card-surface/50 rounded-2xl p-6 space-y-3 h-full">
    <div className="w-8 h-8 bg-border-subtle dark:bg-border-subtle/40 rounded animate-pulse" />
    <div className="h-5 bg-border-subtle dark:bg-border-subtle/40 rounded w-3/4 animate-pulse" />
    <div className="h-3 bg-border-subtle dark:bg-border-subtle/40 rounded w-full animate-pulse" />
    <div className="h-3 bg-border-subtle dark:bg-border-subtle/40 rounded w-2/3 animate-pulse" />
  </div>
);
