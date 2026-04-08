import { apiInstance } from "@/lib/api";

export async function getList(id: string) {
  try {
    const response = await apiInstance.get<any>(`/lists/${id}`);
    return response.data;
  } catch (e: any) {
    if (e?.response?.status === 404) throw new Error("List not found");
    throw e;
  }
}
