import { PostDetailPageClient } from "@/features/feed/components/post-detail-page-client";

type PostDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostDetailRoute({ params }: PostDetailRouteProps) {
  const { id } = await params;

  return <PostDetailPageClient postId={id} />;
}
