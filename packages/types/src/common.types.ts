/**
 * Common utility types shared across the Recto monorepo
 */

/**
 * Paginated response wrapper for list endpoints
 */
export type PaginatedResponse<T> = {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Standard API response wrapper
 */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    details?: Record<string, unknown>;
  };
};

/**
 * Error response from API
 */
export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

/**
 * Generic request metadata
 */
export type RequestMetadata = {
  timestamp: Date;
  userId?: string;
  requestId: string;
};

/**
 * Pagination query parameters
 */
export type PaginationParams = {
  cursor?: string;
  limit: number;
};

/**
 * Sort order for list endpoints
 */
export type SortOrder = "asc" | "desc";

/**
 * Generic sort parameters
 */
export type SortParams<T extends string = string> = {
  sortBy: T;
  order: SortOrder;
};
