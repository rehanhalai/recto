import { apiInstance } from "@/lib/api";
import type {
  ApiEnvelope,
  Post,
  PostWithRelations,
  PaginatedResponse,
} from "@recto/types";

export async function getExplorePosts({
  limit = 10,
  cursor,
}: {
  limit?: number;
  cursor?: string;
} = {}): Promise<PaginatedResponse<PostWithRelations>> {
  try {
    const response = await apiInstance.get<
      ApiEnvelope<PaginatedResponse<PostWithRelations>>
    >("/posts/feed", {
      limit,
      cursor,
    });

    return response.data;
  } catch {
    return {
      data: [],
      nextCursor: null,
      hasMore: false,
    };
  }
}

export async function getTrendingPosts(limit = 10): Promise<Post[]> {
  const response = await apiInstance.get<ApiEnvelope<Post[]>>(
    "/posts/trendings",
    {
      limit,
    },
  );

  return response.data;
}
