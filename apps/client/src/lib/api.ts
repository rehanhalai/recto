import { config } from "@/config";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | boolean | null | undefined;

type QueryParams = Record<string, QueryValue>;

const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
};

const shouldUseJsonHeaders = (body: unknown): boolean => {
  if (typeof FormData === "undefined") {
    return true;
  }

  return !(body instanceof FormData);
};

const buildUrl = (endpoint: string, params?: QueryParams): string => {
  const url = new URL(`${config.apiUrl}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
};

const extractMessage = (body: unknown, fallback: string): string => {
  if (body && typeof body === "object" && "message" in body) {
    const maybeMessage = (body as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }
  }

  return fallback;
};

const dispatchUnauthorizedEvent = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:unauthorized"));
  }
};

const request = async <T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  endpoint: string,
  options?: {
    params?: QueryParams;
    body?: unknown;
  },
): Promise<T> => {
  const body = options?.body;

  const response = await fetch(buildUrl(endpoint, options?.params), {
    method,
    credentials: "include",
    headers: shouldUseJsonHeaders(body) ? defaultHeaders : undefined,
    body:
      body !== undefined && method !== "GET"
        ? shouldUseJsonHeaders(body)
          ? JSON.stringify(body)
          : (body as BodyInit)
        : undefined,
  });

  if (response.status === 204) {
    return null as T;
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      dispatchUnauthorizedEvent();
    }

    const fallbackMessage =
      response.statusText || `HTTP error! status: ${response.status}`;
    throw new ApiError(
      response.status,
      extractMessage(responseBody, fallbackMessage),
      responseBody,
    );
  }

  return responseBody as T;
};

export const apiInstance = {
  get: <T>(endpoint: string, params?: QueryParams) =>
    request<T>("GET", endpoint, { params }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>("POST", endpoint, { body }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>("PATCH", endpoint, { body }),
  delete: <T>(endpoint: string) => request<T>("DELETE", endpoint),
};
