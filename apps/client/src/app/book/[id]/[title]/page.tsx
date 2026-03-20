import { Metadata } from "next";
import BookDetailClient from "./book-detail-client";

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
  const { title } = await params;
  return {
    title: `${title.replaceAll("-", " ")} | Recto`,
    description: "Discover and manage your book collection",
  };
}

export default async function BookPage({ params, searchParams }: Props) {
  const { id, title } = await params;
  const awaitedSearchParams = await searchParams;
  const authorsParam = awaitedSearchParams?.authors;
  const authors = authorsParam
    ? authorsParam.split(",").map((a) => a.trim())
    : undefined;

  return (
    <div className="min-h-screen bg-paper dark:bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <BookDetailClient volumeId={id} title={title} authors={authors} />
      </div>
    </div>
  );
}
