import { StandardLayout } from "@/components/layout";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseLoading() {
  return (
    <StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
      <div className="space-y-10">
        <section className="rounded-2xl border border-border-subtle bg-card-surface p-6 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </section>

        {Array.from({ length: 4 }).map((_, index) => (
          <section key={index} className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-3 w-32" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((__, cardIndex) => (
                <div key={cardIndex} className="space-y-2">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </StandardLayout>
  );
}
