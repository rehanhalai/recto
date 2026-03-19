import { FeedHome, getExplorePosts } from "@/features/feed";

export default async function HomePage() {
  const initialPosts = await getExplorePosts({ limit: 15 });

  return <FeedHome initialPosts={initialPosts} />;
}
