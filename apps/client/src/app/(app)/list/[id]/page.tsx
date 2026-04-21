import { notFound } from "next/navigation";
import { getList, ListPageClient } from "@/features/list";

interface ListPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListPage({ params }: ListPageProps) {
  const { id } = await params;
  const list = await getList(id);

  if (!list) return notFound();

  return <ListPageClient list={list} />;
}
