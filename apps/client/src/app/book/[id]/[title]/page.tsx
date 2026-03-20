import { Metadata } from "next";
import BookDetailClient from "./book-detail-client";
import { FeedLayout } from "@/features/feed/components/feed-layout";
import { SidebarLeft } from "@/features/sidebar/components/sidebar-left";
import { BookSidebar } from "@/features/book/components/book-sidebar";
import { config } from "@/config";
import type { Book } from "@/features/book/types";

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
  const { id, title } = await params;
  const initialBook = await fetchBookSSR(id);
  const awaitedSearchParams = await searchParams;
  const authorsParam = awaitedSearchParams?.authors;
  const authors = authorsParam
    ? authorsParam.split(",").map((a) => a.trim())
    : undefined;

  return (
    <div className="min-h-screen bg-paper dark:bg-background">
      <FeedLayout
        leftSidebar={<SidebarLeft showCurrentReading={false} />}
        rightPanel={initialBook ? <BookSidebar book={initialBook} /> : <div />}
      >
        <BookDetailClient
          volumeId={id}
          title={title}
          authors={authors}
          initialBook={initialBook}
        />
      </FeedLayout>
    </div>
  );
}

async function fetchBookSSR(volumeId: string): Promise<Book | null> {
  try {
    const response = await fetch(
      `${config.apiUrl}/book/${encodeURIComponent(volumeId)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Book & { data?: Book };
    return data?.data ?? data;
  } catch {
    return null;
  }
}

function getFirstAuthor(book: Book | null) {
  if (
    !book?.authors ||
    !Array.isArray(book.authors) ||
    book.authors.length === 0
  ) {
    return undefined;
  }

  const author = book.authors[0];
  return typeof author === "string" ? author : author?.authorName;
}

function stripTags(text: string) {
  return text.replace(/<[^>]+>/g, "").trim();
}
