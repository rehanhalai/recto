"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowSquareOut } from "@phosphor-icons/react";
import { useBookAffiliateLinks } from "../../hooks/use-book-affiliate-links";

// Helper hook for responsive design
function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    const onChange = (event: MediaQueryListEvent) => {
      setValue(event.matches);
    };

    const result = window.matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}

export function BuyBookResponsive({
  bookId,
  className,
}: {
  bookId: string;
  className?: string;
}) {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const { data: affiliateData, isLoading } = useBookAffiliateLinks(
    bookId,
    "IN",
  );
  const links = affiliateData?.data?.links
    ? Object.values(affiliateData.data.links)
    : [];

  const trigger = (
    <Button variant="outline" className={className}>
      <ShoppingCart size={18} className="mr-2 text-ink-muted" />
      Buy
    </Button>
  );

  const content = (
    <>
      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Get this book
      </div>
      <div className="mt-1 space-y-1">
        {isLoading ? (
          <div className="px-2 py-2 text-sm text-muted-foreground">
            Fetching links...
          </div>
        ) : links.length > 0 ? (
          links.map((link) => (
            <DropdownMenuItem
              key={link.platform}
              asChild
              className="cursor-pointer px-2"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between w-full rounded-md border border-transparent px-2 py-3 sm:py-1.5 hover:bg-muted transition-colors sm:border-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-sm font-medium sm:font-normal">
                    Buy on {link.name}
                  </span>
                </div>
                <ArrowSquareOut size={14} className="opacity-40" />
              </a>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-2 py-2 text-sm text-muted-foreground">
            No purchase links found.
          </div>
        )}
      </div>
    </>
  );

  // Desktop: Floating Popover (DropdownMenu)
  if (isDesktop) {
    return (
      <DropdownMenu defaultOpen={true}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-2" align="start" sideOffset={8}>
          {content}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Mobile: Bottom Sheet
  return (
    <Sheet defaultOpen={true}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[50vh] overflow-y-auto">
        <SheetHeader className="text-left mb-4">
          <SheetTitle>Get this book</SheetTitle>
          <SheetDescription>
            Choose a platform to purchase this book from.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-2">{content}</div>
      </SheetContent>
    </Sheet>
  );
}
