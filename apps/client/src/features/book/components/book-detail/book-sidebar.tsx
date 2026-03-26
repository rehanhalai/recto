"use client";

import Link from "next/link";
import Image from "next/image";
import { StarIcon } from "@phosphor-icons/react";
import type { Book } from "../../types";
import { useBookStats } from "../../hooks/use-book-stats";
import { useBookAffiliateLinks } from "../../hooks/use-book-affiliate-links";

export function BookSidebar({ book }: { book: Book }) {
  const { data: stats } = useBookStats(book.id);
  const { data: affiliateData } = useBookAffiliateLinks(book.id, "IN");
  const links = affiliateData?.links ? Object.values(affiliateData.links) : [];

  const rows = [
    { label: "5★", key: "five", value: stats?.distribution?.five ?? 0 },
    { label: "4★", key: "four", value: stats?.distribution?.four ?? 0 },
    { label: "3★", key: "three", value: stats?.distribution?.three ?? 0 },
    { label: "2★", key: "two", value: stats?.distribution?.two ?? 0 },
    { label: "1★", key: "one", value: stats?.distribution?.one ?? 0 },
  ] as const;

  return (
    <div className="space-y-4 py-2">
      <section className="rounded-xl border border-border-subtle/70 bg-card/50 p-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Community stats
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <MetricCard label="Readers" value={stats?.readers ?? 0} />
          <MetricCard label="Reviews" value={stats?.reviews ?? 0} />
          <MetricCard label="Lists" value={stats?.lists ?? 0} />
        </div>
      </section>

      <section className="rounded-xl border border-border-subtle/70 bg-card/50 p-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Average rating
        </h3>

        <div className="mb-3 text-center">
          <p className="text-2xl font-semibold text-foreground">
            {stats?.averageRating && stats.averageRating > 0
              ? stats.averageRating.toFixed(1)
              : "No ratings yet"}
          </p>
          {(stats?.averageRating ?? 0) > 0 && (
            <div className="mt-1 flex justify-center text-amber-400">
              <StarIcon weight="fill" size={18} />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center gap-2">
              <span className="w-6 text-[11px] text-muted-foreground">
                {row.label}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${row.value}%` }}
                />
              </div>
              <span className="w-8 text-right text-[11px] text-muted-foreground">
                {row.value}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {links.length > 0 && (
        <section className="rounded-xl border border-border-subtle/70 bg-card/50 p-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Get this book
          </h3>
          <div className="space-y-2">
            {links.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-md border border-border-subtle bg-background px-3 py-2 text-sm hover:bg-muted"
              >
                Buy on {link.name}
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-border-subtle/70 bg-card/50 p-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Readers also enjoyed
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-border-subtle/60 bg-background p-2"
            >
              <div className="relative mx-auto mb-2 aspect-[2/3] w-14 overflow-hidden rounded bg-muted">
                <Image
                  src="/landingPage/books/book-one.webp"
                  alt="Coming soon"
                  fill
                  className="object-cover opacity-50"
                  sizes="56px"
                />
              </div>
              <p className="line-clamp-1 text-xs text-foreground">
                Coming soon
              </p>
              <p className="line-clamp-1 text-[11px] text-muted-foreground">
                Recommendations
              </p>
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Personalized recommendations are coming in post-MVP.
        </p>
      </section>

      <div className="hidden">
        <Link href="/browse">Browse books</Link>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border-subtle/70 bg-background/80 px-2 py-2">
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
