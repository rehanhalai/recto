import { config } from "@/config";

/**
 * Token management utilities - Handles access tokens
 */
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(config.auth.accessTokenKey);
  },

  setAccessToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(config.auth.accessTokenKey, token);
  },

  removeAccessToken: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(config.auth.accessTokenKey);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(config.auth.refreshTokenKey);
  },

  setRefreshToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(config.auth.refreshTokenKey, token);
  },

  removeRefreshToken: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(config.auth.refreshTokenKey);
  },

  clearTokens: (): void => {
    tokenManager.removeAccessToken();
    tokenManager.removeRefreshToken();
  },
};

/**
 * Simple API client with base URL configuration
 */

export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

const prepareOptions = (options?: ApiRequestOptions) => {
  const { requiresAuth = true, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // We are using httpOnly cookies now, so we don't need to manually attach the token
  // The browser will automatically send cookies with 'credentials: include'

  return {
    fetchOptions: {
      ...fetchOptions,
      credentials: "include" as RequestCredentials,
    },
    headers,
  };
};

/**
 * Helper to handle responses and dispatch auth events
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        // Dispatch global event for useAuth hook to catch
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Simple API client with base URL configuration
 */
export const apiClient = {
  get: async <T>(endpoint: string, options?: ApiRequestOptions): Promise<T> => {
    const { fetchOptions, headers } = prepareOptions(options);

    const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: "GET",
      headers,
    });

    return handleResponse(response);
  },

  post: async <T>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions,
  ): Promise<T> => {
    const { fetchOptions, headers } = prepareOptions(options);

    const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse(response);
  },

  put: async <T>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions,
  ): Promise<T> => {
    const { fetchOptions, headers } = prepareOptions(options);

    const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse(response);
  },

  patch: async <T>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions,
  ): Promise<T> => {
    const { fetchOptions, headers } = prepareOptions(options);

    const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: "PATCH",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse(response);
  },

  delete: async <T>(
    endpoint: string,
    options?: ApiRequestOptions,
  ): Promise<T> => {
    const { fetchOptions, headers } = prepareOptions(options);

    const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: "DELETE",
      headers,
    });

    return handleResponse(response);
  },

  getBaseUrl: (): string => {
    return config.api.baseUrl;
  },
};
