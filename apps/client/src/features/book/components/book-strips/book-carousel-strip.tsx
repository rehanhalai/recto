"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import type { Book } from "../../types";
import { BookCard } from "./book-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface BookCarouselStripProps {
  title: string;
  subtitle: string;
  href: string;
  books?: Book[];
  isLoading: boolean;
  compact?: boolean;
}

export function BookCarouselStrip({
  title,
  subtitle,
  href,
  books,
  isLoading,
  compact = false,
}: BookCarouselStripProps) {
  const itemBasisClass = compact
    ? "pl-4 basis-32 md:basis-40 lg:basis-44"
    : "pl-4 basis-40 md:basis-48 lg:basis-52";

  return (
    <section className="flex flex-col gap-6 mb-12 w-full">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h2 className="font-serif italic text-2xl text-ink font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-ink-muted font-mono tracking-widest uppercase">
            {subtitle}
          </p>
        </div>
        <Link
          href={href}
          className="group flex items-center gap-1.5 font-sans text-sm font-medium text-ink-muted hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-border-subtle rounded-sm py-1 px-2 border border-border-subtle hover:border-ink hover:bg-card-surface"
        >
          See All
          <ArrowRight
            size={14}
            weight="bold"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <CarouselItem key={i} className={itemBasisClass}>
                    <div className="flex flex-col gap-3">
                      <div className="w-full aspect-2/3 bg-card-surface rounded-md animate-pulse shadow-sm" />
                      <div className="space-y-2">
                        <div className="h-4 bg-border-subtle/30 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-border-subtle/20 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  </CarouselItem>
                ))
              : books?.map((book) => (
                  <CarouselItem key={book.id} className={itemBasisClass}>
                    <BookCard book={book} />
                  </CarouselItem>
                ))}
          </CarouselContent>

          <div className="hidden md:block">
            <CarouselPrevious className="absolute -left-4 top-1/3 -translate-y-1/2 bg-paper/90 backdrop-blur shadow-md border-border-subtle hover:bg-card-surface hover:text-ink text-ink-muted h-10 w-10 z-10" />
            <CarouselNext className="absolute -right-4 top-1/3 -translate-y-1/2 bg-paper/90 backdrop-blur shadow-md border-border-subtle hover:bg-card-surface hover:text-ink text-ink-muted h-10 w-10 z-10" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
