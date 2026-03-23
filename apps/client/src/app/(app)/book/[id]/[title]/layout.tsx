import { Footer, AppLayout } from "@/components/layout";
import { SidebarLeft } from "@/features/sidebar/components/sidebar-left";
import { BookSidebar } from "@/features/book/components/book-detail/book-sidebar";
import { Metadata } from "next";
import { fetchBookSSR } from "@/features/book/service/book-api";

export const metadata: Metadata = {
  title: "",
  description:
    "Discover your next great read with curated book recommendations, trending lists, and insightful blogs.",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

export default async function bookLayout({
  children,
  params,
}: Readonly<Props>) {
  const { id } = await params;
  const initialBook = await fetchBookSSR(id);

  return (
    <AppLayout
      leftSidebar={<SidebarLeft showCurrentReading={false} />}
      rightPanel={initialBook ? <BookSidebar book={initialBook} /> : <div />}
    >
      {children}
    </AppLayout>
  );
}
