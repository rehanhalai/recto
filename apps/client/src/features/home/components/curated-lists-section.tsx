import Link from "next/link";
import { CaretRightIcon, BookOpenIcon } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui";
import { BookListResponse } from "@/features/home/service/home.service";
import { ListCardSkeleton } from "./skeletons";

interface CuratedListsSectionProps {
  lists: BookListResponse[];
  isLoading: boolean;
}

export const CuratedListsSection = ({
  lists,
  isLoading,
}: CuratedListsSectionProps) => (
  <section className="mb-20">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <h2 className="italic-serif text-3xl md:text-4xl text-ink dark:text-ink flex items-center gap-2">
        <div className="w-8 h-8 text-accent dark:text-accent">
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        </div>
        Curated Lists
      </h2>
      <Link
        href="/lists"
        className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-accent-dark dark:text-accent hover:text-accent-dark/80 dark:hover:text-accent/80 transition-colors whitespace-nowrap"
      >
        See All Lists
        <CaretRightIcon className="w-4 h-4" />
      </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        [...Array(3)].map((_, i) => <ListCardSkeleton key={i} />)
      ) : lists.length > 0 ? (
        lists.map((list) => (
          <Link key={list._id} href={`/lists/${list._id}`}>
            <Card className="bg-card-surface dark:bg-card-surface/50 border border-border-subtle dark:border-border-subtle/20 shadow-lg dark:shadow-lg hover:shadow-xl dark:hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden group h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-4 p-4 bg-accent/10 dark:bg-accent/20 rounded-lg shrink-0">
                  <BookOpenIcon className="w-8 h-8 text-accent dark:text-accent" />
                </div>

                <h3 className="font-bold text-xl text-ink dark:text-ink mb-2 line-clamp-2 group-hover:text-accent dark:group-hover:text-accent transition-colors">
                  {list.name}
                </h3>
                <p className="text-sm text-ink-muted dark:text-ink-muted mb-4 line-clamp-2 grow">
                  {list.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border-subtle dark:border-border-subtle/20">
                  <span className="text-xs font-semibold text-accent dark:text-accent uppercase tracking-wider">
                    {list.book_count} Books
                  </span>
                  <span className="text-xs text-ink-muted dark:text-ink-muted">
                    by {list.user_id?.username || "Anonymous"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-ink-muted dark:text-ink-muted">
            No public lists available at this time.
          </p>
        </div>
      )}
    </div>
  </section>
);
