import { apiInstance } from "@/lib/api";

export async function getList(id: string) {
	try {
		const response = await apiInstance.get<any>(`/lists/${id}`);
		return response.data;
	} catch (e) {
		return null;
	}
}
