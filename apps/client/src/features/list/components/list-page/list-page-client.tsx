"use client";

import { StandardLayout } from "@/components/layout";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";
import { ListHeader } from "./list-header";
import { ListActionBar } from "./list-action-bar";
import { ListTable } from "./list-table";

interface ListPageClientProps {
  list: any;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ListPageClient({ list }: ListPageClientProps) {
  return (
    <StandardLayout
      leftSidebar={<SidebarLeft />}
      rightSidebar={<SidebarRight />}
    >
      <div className="flex flex-col min-h-screen bg-background pb-20 rounded-xl overflow-hidden border border-border-subtle/20 shadow-sm">
        <ListHeader list={list} formatDate={formatDate} />
        <ListActionBar />
        <ListTable items={list.items} formatDate={formatDate} />
      </div>
    </StandardLayout>
  );
}
