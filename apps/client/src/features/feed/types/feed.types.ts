/**
 * Feed feature types — re-exports shared types from @recto/types
 * and defines local API envelope type used by feed hooks.
 */

export type { PostWithRelations, PaginatedResponse } from "@recto/types";

/** Standard API response wrapper from the server */
export type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};
