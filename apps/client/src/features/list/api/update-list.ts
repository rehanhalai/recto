import { apiInstance } from "@/lib/api";

export async function updateList(
  listId: string,
  data: {
    name?: string;
    description?: string;
    is_public?: boolean;
  },
) {
  const response = await apiInstance.patch<any>(`/lists/${listId}`, data);
  return response.data;
}
