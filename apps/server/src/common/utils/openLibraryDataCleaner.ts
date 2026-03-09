import { IBook } from '../../modules/book/types/book.type';

/**
 * OPEN LIBRARY RAW TYPES
 * Defines the structure of the response from https://openlibrary.org/works/{ID}.json
 */
export interface IOpenLibraryWork {
  key: string;
  title: string;
  subtitle?: string;
  description?: string | { type: string; value: string };
  subjects?: string[]; // These become your genres
  covers?: number[];
  first_publish_date?: string;
  authors?: Array<{ author: { key: string } }>;
  links?: Array<{ title: string; url: string }>;
}

export const OpenLibraryFactory = {
  /**
   * HELPER: Builds the cover image URL
   */
  getCoverUrl: (
    coverId: number | undefined | null,
    size: 'S' | 'M' | 'L' = 'L',
  ): string => {
    return coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
      : '';
  },

  /**
   * HELPER: Parses Open Library's messy date strings
   * Ex: "2004", "May 2004", "2004-05-01" -> string (postgres date format or just store the year string if needed)
   * The Drizzle schema uses varchar('release_date', { length: 50 }) so we can just return the raw string or parsed string.
   */
  parseDate: (dateString?: string): string | null => {
    if (!dateString) return null;
    return dateString; // Keeping it as a string instead of a Date object because schema defines releaseDate as varchar
  },

  /**
   * HELPER: Extracts description which can be a string or an object
   */
  getDescription: (desc?: string | { value: string }): string => {
    if (!desc) return '';
    return typeof desc === 'string' ? desc : desc.value || '';
  },

  normalizeWorkData: (
    workData: IOpenLibraryWork,
    fallbackData?: Partial<IBook>,
  ): Partial<IBook> => {
    const normalizeAuthors = (input: string | string[] | undefined | null) => {
      if (!input) return ['Unknown Author'];
      if (typeof input === 'string')
        return input.trim() ? [input.trim()] : ['Unknown Author'];
      if (Array.isArray(input))
        return input.length > 0 ? input : ['Unknown Author'];
      return ['Unknown Author'];
    };

    const authors = normalizeAuthors(fallbackData?.authors);
    const coverId = workData.covers?.[0] || fallbackData?.coverI;

    return {
      externalId: workData.key.replace('/works/', ''),
      title: fallbackData?.title?.trim() || workData.title,
      subtitle: workData.subtitle || fallbackData?.subtitle || null,
      authors: authors,
      description: OpenLibraryFactory.getDescription(workData.description),
      releaseDate:
        OpenLibraryFactory.parseDate(workData.first_publish_date) ||
        fallbackData?.releaseDate ||
        null,
      genres: workData.subjects
        ? workData.subjects
        : fallbackData?.genres || [],
      coverI: coverId,
      coverImage: OpenLibraryFactory.getCoverUrl(coverId),
      links: workData.links
        ? workData.links.map((link) => ({
            title: link.title,
            url: link.url,
          }))
        : fallbackData?.links || [],
    };
  },
};
