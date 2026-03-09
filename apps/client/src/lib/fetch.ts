import { config } from "@/config";

export interface ApiFetchOptions extends RequestInit {
  // Add any custom options if needed in the future
}

export const apiFetch = async <T>(
  endpoint: string,
  options?: ApiFetchOptions,
): Promise<T> => {
  const url = `${config.api.baseUrl}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
    // This ensures cookies (including httpOnly tokens) are sent to the backend
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Not all responses will have JSON (e.g. 204 No Content), but assuming most do.
  return response.json();
};

export const getBaseUrl = (): string => {
  return config.api.baseUrl;
};
