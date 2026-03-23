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

  return {
    title: `${plainTitle}${authorFromBook ? ` by ${authorFromBook}` : ""} | Recto`,
    description: book?.description
      ? `${plainTitle}${authorFromBook ? ` by ${authorFromBook}` : ""}. ${stripTags(book.description).slice(0, 140)}`
      : `Discover ${plainTitle}${authorFromBook ? ` by ${authorFromBook}` : ""} on Recto.`,
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
