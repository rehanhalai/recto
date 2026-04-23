import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getList, ListPageClient } from "@/features/list";

interface ListPageProps {
  params: Promise<{ id: string }>;
}

type ListOwner = {
  userName?: string | null;
};

type ListBookItem = {
  book?: {
    title?: string | null;
    coverImage?: string | null;
  };
};

type ListEntity = {
  id: string;
  name?: string | null;
  description?: string | null;
  itemCount?: number | null;
  owner?: ListOwner | null;
  items?: ListBookItem[];
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://recto.social";

const getListById = cache(async (id: string): Promise<ListEntity | null> => {
  try {
    return (await getList(id)) as ListEntity;
  } catch {
    return null;
  }
});

const truncate = (value: string, max = 160): string => {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}...`;
};

export async function generateMetadata({
  params,
}: ListPageProps): Promise<Metadata> {
  const { id } = await params;
  const list = await getListById(id);

  if (!list) {
    return {
      title: "List Not Found | Recto",
      description: "The requested reading list could not be found on Recto.",
      robots: { index: false, follow: false },
    };
  }

  const listName = list.name || "Reading List";
  const ownerName = list.owner?.userName;
  const description = truncate(
    list.description ||
      `Explore ${listName}${ownerName ? ` by ${ownerName}` : ""} on Recto with curated book picks and reader insights.`,
  );
  const canonicalPath = `/list/${id}`;
  const previewImage = list.items?.find((item) => item.book?.coverImage)?.book
    ?.coverImage;

  return {
    title: `${listName} | Recto Lists`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    keywords: [
      listName,
      "book list",
      "reading recommendations",
      "curated list",
      "Recto",
    ],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${listName} | Recto Lists`,
      description,
      url: `${siteUrl}${canonicalPath}`,
      type: "article",
      siteName: "Recto",
      images: previewImage ? [{ url: previewImage, alt: listName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${listName} | Recto Lists`,
      description,
      images: previewImage ? [previewImage] : undefined,
    },
  };
}

export default async function ListPage({ params }: ListPageProps) {
  const { id } = await params;
  const list = await getListById(id);

  if (!list) return notFound();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: list.name || "Recto Reading List",
    description: list.description || undefined,
    numberOfItems: list.itemCount || list.items?.length || 0,
    itemListElement:
      list.items?.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.book?.title || `Book ${index + 1}`,
      })) || [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <ListPageClient list={list} />
    </>
  );
}
