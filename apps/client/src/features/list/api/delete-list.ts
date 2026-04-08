import { apiInstance } from "@/lib/api";

export async function deleteList(listId: string) {
  const response = await apiInstance.delete<any>(`/lists/${listId}`);
  return response.data;
}
