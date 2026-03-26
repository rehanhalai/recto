import { Metadata } from "next";
import type { Book } from "@/features/book/types";
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
  searchParams?: Promise<{
    authors?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, title } = await params;
  const book = await fetchBookSSR(id);
  const authorFromBook = getFirstAuthor(book);
  const plainTitle = (book?.title || title).replaceAll("-", " ");
  const description = book?.description
    ? stripTags(book.description).slice(0, 160)
    : `Discover ${plainTitle}${authorFromBook ? ` by ${authorFromBook}` : ""} on Recto.`;

  const finalTitle = `${plainTitle}${authorFromBook ? ` by ${authorFromBook}` : ""} | Recto`;

  return {
    title: finalTitle,
    description,
    openGraph: {
      title: finalTitle,
      description,
      type: "book",
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
    } as any,
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description,
      images: book?.coverImage ? [book.coverImage] : undefined,
    },
  };
}

export default async function BookPage({ params, searchParams }: Props) {
  const { id } = await params;
  const InitialBook = await fetchBookSSR(id);
  const awaitedSearchParams = await searchParams;
  const authorsParam = awaitedSearchParams?.authors;
  const authors = authorsParam
    ? authorsParam.split(",").map((a) => a.trim())
    : undefined;

  if (!InitialBook) return <div>Book not found</div>;

  return (
    <div className="min-h-screen bg-paper dark:bg-background">
      <BookDetail Book={InitialBook} />
    </div>
  );
}
