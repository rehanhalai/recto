import { apiInstance } from "@/lib/api";
import type { PostWithRelations, PaginatedResponse } from "@recto/types";

type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export async function getExplorePosts({
  limit = 10,
  cursor,
}: {
  limit?: number;
  cursor?: string;
} = {}): Promise<PaginatedResponse<PostWithRelations>> {
  const response = await apiInstance.get<
    ApiEnvelope<PaginatedResponse<PostWithRelations>>
  >("/posts/feed", {
    limit,
    cursor,
  });

  return response.data;
}
