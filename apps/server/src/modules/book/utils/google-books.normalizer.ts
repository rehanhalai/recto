import {
  GoogleBooksSearchResponse,
  GoogleBooksVolume,
  NormalizedBook,
} from "../types/google-books.types";

export function filterValidVolume(volume: GoogleBooksVolume): boolean {
  const volumeInfo = volume.volumeInfo;
  const authors = (volumeInfo.authors || [])
    .map((author) => author.trim())
    .filter(Boolean);
  const description = volumeInfo.description?.trim();
  const isbn13 = extractIsbn13(volume);

  return (
    authors.length > 0 &&
    Boolean(volumeInfo.imageLinks?.thumbnail) &&
    Boolean(description) &&
    Boolean(isbn13) &&
    volumeInfo.language === "en" &&
    typeof volumeInfo.pageCount === "number" &&
    volumeInfo.pageCount > 0
  );
}

export function extractIsbn13(volume: GoogleBooksVolume): string | undefined {
  return volume.volumeInfo.industryIdentifiers?.find(
    (identifier) => identifier.type === "ISBN_13",
  )?.identifier;
}

export function normalizeVolume(volume: GoogleBooksVolume): NormalizedBook {
  const volumeInfo = volume.volumeInfo;
  const authors = (volumeInfo.authors || [])
    .map((author) => author.trim())
    .filter(Boolean);
  const description = volumeInfo.description?.trim();
  const subtitle = volumeInfo.subtitle?.trim();

  return {
    sourceId: volume.id,
    source: "google_books",
    title: volumeInfo.title.trim(),
    subtitle: subtitle || undefined,
    description: description || undefined,
    releaseDate: volumeInfo.publishedDate,
    pageCount: volumeInfo.pageCount,
    language: volumeInfo.language,
    isbn13: extractIsbn13(volume),
    coverImage: volumeInfo.imageLinks?.thumbnail,
    googleRating: volumeInfo.averageRating,
    googleRatingsCount: volumeInfo.ratingsCount,
    authors,
    categories: volumeInfo.categories || [],
  };
}

export function normalizeSearchResults(
  response: GoogleBooksSearchResponse,
): NormalizedBook[] {
  return (response.items || []).filter(filterValidVolume).map(normalizeVolume);
}
