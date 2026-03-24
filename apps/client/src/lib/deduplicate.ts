/**
 * Generic deduplication utility.
 * Filters out duplicate items from an array based on a key extractor function.
 *
 * @example
 * const unique = deduplicateByKey(books, (b) => b.sourceId);
 */
export function deduplicateByKey<T>(
  items: T[],
  keyFn: (item: T) => string,
): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
