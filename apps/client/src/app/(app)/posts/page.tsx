import { getExplorePosts } from "@/features/feed";
import { ExploreFeed } from "@/features/feed/components/explore-feed";

export default async function PostsPage() {
  const initialPosts = await getExplorePosts({ limit: 15 });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 w-full">
      <div className="flex flex-col gap-6 py-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif italic text-ink font-bold tracking-tight">
            Community Feed
          </h1>
          <p className="text-ink-muted">
            The latest discussions, reviews, and thoughts from the Recto
            community.
          </p>
        </div>

        <ExploreFeed initialData={initialPosts} />
      </div>
    </div>
  );
}
