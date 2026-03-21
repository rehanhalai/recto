export function BookDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-10 animate-pulse">
        {/* Header Section */}
        <div className="flex flex-row md:gap-10 gap-4 mb-6">
          <div className="flex-1 min-w-0 flex flex-col justify-start md:justify-center space-y-4">
            {/* Genre badges */}
            <div className="flex flex-wrap gap-1.5">
              <div className="h-5 w-14 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded" />
              <div className="h-5 w-12 bg-muted rounded" />
            </div>

            {/* Title - multi-line */}
            <div className="space-y-2">
              <div className="h-8 md:h-10 w-full bg-muted rounded" />
              <div className="h-8 md:h-10 w-5/6 bg-muted rounded" />
            </div>

            {/* Author */}
            <div className="h-5 md:h-6 w-2/5 bg-muted rounded" />

            {/* Rating, Language, Pages */}
            <div className="flex items-center gap-3 text-xs md:text-sm">
              <div className="h-5 w-12 bg-muted rounded" />
              <div className="h-4 w-1 bg-muted rounded" />
              <div className="h-5 w-20 bg-muted rounded" />
              <div className="h-4 w-1 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
          </div>

          {/* Book Cover */}
          <div className="shrink-0 w-[100px] md:w-[220px] shadow-lg rounded-md md:rounded-lg overflow-hidden self-start md:self-center aspect-[2/3] bg-muted" />
        </div>

        {/* Status Buttons Section */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-3 gap-2 md:gap-4 p-1 bg-muted/30 rounded-xl">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <div className="flex-1 h-12 bg-muted rounded-lg" />
            <div className="h-12 w-12 bg-muted rounded-lg" />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="w-full">
          {/* Tab Headers */}
          <div className="flex border-b border-border mb-6">
            <div className="flex-1 h-10 flex items-center pb-3">
              <div className="h-5 w-24 bg-muted rounded" />
            </div>
            <div className="flex-1 h-10 flex items-center pb-3">
              <div className="h-5 w-20 bg-muted rounded" />
            </div>
          </div>

          {/* Tab Content - Description Section */}
          <div className="space-y-4 mb-8">
            {/* Description paragraphs */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-4/5 bg-muted rounded" />
                </div>
              ))}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-4 w-40 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-8 w-24 bg-muted rounded" />
          </div>

          {/* Review Items */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-card border border-border/40 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="h-3 w-3 bg-muted rounded-full" />
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-3/4 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Purchase Links Section */}
        <div className="mt-8 space-y-3">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-20 bg-muted rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
