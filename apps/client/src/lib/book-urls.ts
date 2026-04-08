/**
 * Utility functions for generating book-related URLs
 */

/**
 * Generates a URL-friendly slug from a book title
 * @param title - The book title to convert to a slug
 * @returns A URL-safe slug
 */
export function generateBookSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[\/\s]+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Generates a complete book URL path
 * @param sourceId - The book's sourceId (external identifier)
 * @param title - The book title
 * @returns The complete book URL path (e.g., "/book/{sourceId}/{slug}")
 */
export function getBookUrl(
  sourceId: string | undefined,
  title: string,
): string {
  if (!sourceId) throw new Error("Source ID is required to generate book URL");
  const slug = generateBookSlug(title);
  return `/book/${sourceId}/${slug}`;
}
