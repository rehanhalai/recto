import { getExplorePosts } from "@/features/feed";
import { FeedPageClient } from "@/features/feed/components/feed-page-client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initialPosts = await getExplorePosts({ limit: 15 });

  return <FeedPageClient initialPosts={initialPosts} />;
}
