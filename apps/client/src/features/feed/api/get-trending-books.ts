import { apiInstance } from "@/lib/api";
import type { Book } from "../../book/types";
import type { ApiEnvelope } from "@recto/types";

export async function getTrendingBooks(limit = 10): Promise<Book[]> {
  const response = await apiInstance.get<ApiEnvelope<Book[]>>(
    "/book/trending",
    {
      limit,
    },
  );

  return response.data;
}
