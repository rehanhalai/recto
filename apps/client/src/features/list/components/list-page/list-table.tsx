"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MoreHorizontal, Trash2 } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { getBookUrl } from "@/lib/book-urls";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui";
import { useRemoveFromList } from "@/features/book/hooks/use-user-lists";

interface ListTableProps {
  items: any[];
  formatDate: (date: string) => string;
  listId: string;
}

export function ListTable({ items, formatDate, listId }: ListTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 pb-8 text-center opacity-60">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <MoreHorizontal className="text-ink-muted/30 w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1 font-serif italic">
          Empty Shelf
        </h3>
        <p className="text-sm text-ink-muted max-w-50 mx-auto leading-relaxed">
          No books have found their way into this list yet.
        </p>
      </div>
    );
  }

  return (
    <div className="sm:px-6 mt-4">
      <div className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_0.5fr_auto_auto] gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted/60 border-b border-border-subtle/10 mb-2 sticky top-20.5 bg-background z-10 transition-colors duration-300">
        <div className="w-6 text-center">#</div>
        <div>Title</div>
        <div className="hidden md:block">Rating</div>
        <div className="pr-2 text-right">
          <Clock className="w-3.5 h-3.5 ml-auto opacity-50" />
        </div>
        <div className="w-8"></div>
      </div>

      <div className="space-y-0.5">
        {items.map((item: any, index: number) => (
          <BookListRow
            key={item.book.id}
            item={item}
            index={index}
            listId={listId}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  );
}

function BookListRow({
  item,
  index,
  listId,
  formatDate,
}: {
  item: any;
  index: number;
  listId: string;
  formatDate: (date: string) => string;
}) {
  const removeFromListMutation = useRemoveFromList(item.book.id);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromListMutation.mutate(listId);
  };

  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_0.5fr_auto_auto] gap-4 items-center p-2 rounded-md hover:bg-white/5 transition group">
      <div className="w-6 text-center text-ink-muted/50 font-mono text-xs group-hover:text-foreground">
        {index + 1}
      </div>

      <Link
        href={getBookUrl(item.book.sourceId, item.book.title)}
        className="flex items-center gap-3 min-w-0"
      >
        <div className="relative w-10 h-14 rounded overflow-hidden shadow-sm bg-muted/20 border border-white/5 shrink-0">
          {item.book.coverImage ? (
            <Image
              src={item.book.coverImage}
              alt={item.book.title}
              fill
              className="object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-ink/20 bg-muted/5">
              N/A
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm text-foreground truncate group-hover:underline">
            {item.book.title}
          </span>
          <span className="text-ink-muted/70 text-[10px] truncate">
            {item.book.authors?.map((a: any) => a.authorName).join(", ") ||
              "Unknown Author"}
          </span>
        </div>
      </Link>

      <div className="hidden md:flex items-center gap-1.5 min-w-20">
        {item.book.averageRating ? (
          <div className="flex items-center gap-1">
            <StarRating
              rating={Math.round(parseFloat(item.book.averageRating))}
              className="scale-75 origin-left"
            />
            <span className="text-[10px] font-bold text-gold/60">
              {parseFloat(item.book.averageRating).toFixed(1)}
            </span>
          </div>
        ) : (
          <span className="text-ink-muted/20 text-[10px] font-bold tracking-tighter">
            UNRATED
          </span>
        )}
      </div>

      <div className="pr-2 text-right text-[11px] text-ink-muted/20 font-medium whitespace-nowrap">
        {formatDate(item.addedAt)}
      </div>

      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-full text-ink-muted/20 hover:text-foreground transition group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleRemove}
              disabled={removeFromListMutation.isPending}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {removeFromListMutation.isPending
                ? "Removing..."
                : "Remove from list"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
