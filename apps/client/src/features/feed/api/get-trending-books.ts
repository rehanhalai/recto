import { apiInstance } from "@/lib/api";
import type { Book } from "../../book/types";
import { Post } from "@/../../packages/types/src";

type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export async function getTrendingBooks(limit = 10): Promise<Book[]> {
  const response = await apiInstance.get<ApiEnvelope<Book[]>>(
    "/book/trending/books",
    {
      limit,
    },
  );

  return response.data;
}

export async function getTrendingPosts(limit = 10): Promise<Post[]> {
  const response = await apiInstance.get<ApiEnvelope<Post[]>>(
    "/book/trending/posts",
    {
      limit,
    },
  );

  return response.data;
}
