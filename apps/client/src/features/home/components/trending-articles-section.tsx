import Link from "next/link";
import { CaretRightIcon, TrendUpIcon } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui";
import { BlogResponse } from "@/features/home/service/home.service";
import { ListCardSkeleton } from "./skeletons";

interface TrendingArticlesSectionProps {
  blogs: BlogResponse[];
  isLoading: boolean;
}

// Utility to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const TrendingArticlesSection = ({
  blogs,
  isLoading,
}: TrendingArticlesSectionProps) => (
  <section className="mb-20">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <h2 className="italic-serif text-3xl md:text-4xl text-ink dark:text-ink flex items-center gap-2">
        <TrendUpIcon className="w-8 h-8 text-accent dark:text-accent" />
        Trending Articles
      </h2>
      <Link
        href="/blogs"
        className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-accent-dark dark:text-accent hover:text-accent-dark/80 dark:hover:text-accent/80 transition-colors whitespace-nowrap"
      >
        Read All
        <CaretRightIcon className="w-4 h-4" />
      </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        [...Array(3)].map((_, i) => <ListCardSkeleton key={i} />)
      ) : blogs.length > 0 ? (
        blogs.map((blog) => (
          <Link key={blog._id} href={`/blogs/${blog.slug}`}>
            <Card className="bg-card-surface dark:bg-card-surface/50 border border-border-subtle dark:border-border-subtle/20 shadow-lg dark:shadow-lg hover:shadow-xl dark:hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden group h-full flex flex-col">
              {blog.cover_image && (
                <div className="relative aspect-video overflow-hidden bg-linear-to-br from-border-subtle to-border-subtle dark:from-border-subtle/60 dark:to-border-subtle/60 shrink-0">
                  <img
                    src={blog.cover_image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <CardContent className="p-6 flex flex-col grow">
                <h3 className="font-bold text-lg text-ink dark:text-ink mb-2 line-clamp-2 group-hover:text-accent dark:group-hover:text-accent transition-colors">
                  {blog.title}
                </h3>

                <p className="text-sm text-ink-muted dark:text-ink-muted mb-4 line-clamp-3 grow">
                  {blog.content.substring(0, 100)}...
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border-subtle dark:border-border-subtle/20">
                  <span className="text-xs text-ink-muted dark:text-ink-muted font-semibold">
                    {blog.author_id?.username || "Unknown Author"}
                  </span>
                  <span className="text-xs text-ink-muted dark:text-ink-muted">
                    {formatDate(blog.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-ink-muted dark:text-ink-muted">
            No articles available at this time.
          </p>
        </div>
      )}
    </div>
  </section>
);
