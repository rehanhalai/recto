"use client";
import Link from "next/link";
import React from "react";
import { ArrowRight } from "@phosphor-icons/react";

export type FeedSectionProps = {
  title: string;
  href: string;
  children: React.ReactNode;
  isLoading?: boolean;
  skeletonCount?: number;
  skeleton?: React.ReactNode;
};

export function FeedSection({
  title,
  href,
  children,
  isLoading = false,
  skeletonCount = 3,
  skeleton,
}: FeedSectionProps) {
  return (
    <section className="flex flex-col gap-4 mb-10 w-full">
      {/* Header Row */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-serif italic text-xl text-ink font-semibold">
          {title}
        </h2>
        <Link
          href={href}
          className="flex items-center gap-1 font-mono text-xs text-ink-muted hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-border-subtle rounded-sm"
        >
          See all <ArrowRight size={12} weight="bold" />
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-row md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible snap-x snap-mandatory">
        {isLoading && skeleton
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className="min-w-70 w-[85vw] md:w-auto snap-start shrink-0"
              >
                {skeleton}
              </div>
            ))
          : React.Children.map(children, (child, i) => (
              <div
                key={i}
                className="min-w-70 w-[85vw] md:w-auto snap-start shrink-0 flex items-stretch"
              >
                {child}
              </div>
            ))}
      </div>
    </section>
  );
}
