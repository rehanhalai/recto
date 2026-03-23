"use client";

import { useMemo, useState } from "react";
import sanitizeHtml from "sanitize-html";
import { Button } from "@/components/ui/button";
import type { Book } from "../../types";
import { useBookAffiliateLinks } from "../../hooks/use-book-affiliate-links";

export function BookOverview({ book }: { book: Book }) {
  const [expanded, setExpanded] = useState(false);
  const { data: affiliateData } = useBookAffiliateLinks(book.id, "IN");

  const sanitizedDescription = useMemo(() => {
    const raw = book.description || "";
    return sanitizeHtml(raw, {
      allowedTags: ["p", "b", "i", "br"],
      allowedAttributes: {},
      disallowedTagsMode: "discard",
    });
  }, [book.description]);

  const plainDescriptionLength = useMemo(
    () =>
      sanitizeHtml(book.description || "", {
        allowedTags: [],
        allowedAttributes: {},
      }).length,
    [book.description],
  );

  const hasLongDescription = plainDescriptionLength > 280;
  const links = affiliateData?.links ? Object.values(affiliateData.links) : [];

  const publishedYear = book.releaseDate
    ? String(book.releaseDate).slice(0, 4)
    : "-";

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Overview</h3>
        <div
          className="text-sm leading-relaxed text-ink"
          style={
            expanded || !hasLongDescription
              ? undefined
              : {
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
          }
          dangerouslySetInnerHTML={{
            __html: sanitizedDescription || "No description available.",
          }}
        />
        {hasLongDescription && (
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Read less" : "Read more"}
          </Button>
        )}
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-8 lg:gap-10 rounded-xl border border-border-subtle/70 bg-card/30 p-4 md:p-6">
        <InfoPair label="Publisher" value="-" />
        <InfoPair label="Published" value={publishedYear} />
        <InfoPair label="ISBN" value={book.isbn13 || "-"} />
        <InfoPair label="Language" value={book.language || "Unknown"} />
        <InfoPair
          label="Pages"
          value={book.pageCount ? String(book.pageCount) : "-"}
        />
      </section>

      {links.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Where to buy
          </h4>
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-md border border-border-subtle bg-background px-3 py-1.5 text-sm hover:bg-muted"
              >
                Buy on {link.name}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground md:text-base break-words">
        {value}
      </p>
    </div>
  );
}
