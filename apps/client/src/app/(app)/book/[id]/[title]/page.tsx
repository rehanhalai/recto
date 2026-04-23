import { cache } from "react";
import type { Metadata } from "next";
import { BookDetail } from "@/features/book";
import {
  fetchBookSSR,
  getFirstAuthor,
  stripTags,
} from "@/features/book/service/book-api";

type Props = {
  params: Promise<{
    id: string;
    title: string;
  }>;
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://recto.social";

const getBook = cache(async (id: string) => fetchBookSSR(id));

const truncate = (value: string, max = 160): string => {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}...`;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, title } = await params;
  const book = await getBook(id);
  const authorFromBook = getFirstAuthor(book);
  const plainTitle = (book?.title || title).replaceAll("-", " ");
  const pagePath = `/book/${id}/${title}`;

  const description = truncate(
    book?.description
      ? stripTags(book.description)
      : `Discover ${plainTitle}${authorFromBook ? ` by ${authorFromBook}` : ""} on Recto. Read reviews, ratings, and shelf activity from readers you trust.`,
  );

  const finalTitle = `${plainTitle}${authorFromBook ? ` by ${authorFromBook}` : ""} | Recto`;

  return {
    title: finalTitle,
    description,
    alternates: {
      canonical: pagePath,
    },
    keywords: [
      plainTitle,
      authorFromBook || "book reviews",
      "book details",
      "reader ratings",
      "Recto books",
    ],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: finalTitle,
      description,
      url: `${siteUrl}${pagePath}`,
      type: "article",
      siteName: "Recto",
      images: book?.coverImage
        ? [
            {
              url: book.coverImage,
              width: 800,
              height: 1200,
              alt: plainTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description,
      images: book?.coverImage ? [book.coverImage] : undefined,
    },
  };
}

export default async function BookPage({ params }: Props) {
  const { id } = await params;
  const initialBook = await getBook(id);

  if (!initialBook) return <div>Book not found</div>;

  const bookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: initialBook.title,
    author:
      initialBook.authors?.map((author) => ({
        "@type": "Person",
        name: author,
      })) || [],
    image: initialBook.coverImage || undefined,
    description: initialBook.description
      ? truncate(stripTags(initialBook.description), 220)
      : undefined,
    url: `${siteUrl}/book/${initialBook.sourceId}/${encodeURIComponent(
      initialBook.title.toLowerCase().replaceAll(" ", "-"),
    )}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />
      <div className="min-h-screen bg-paper dark:bg-background">
        <BookDetail Book={initialBook} />
      </div>
    </>
  );
}
