"use client";

import { useMemo, useState } from "react";
import sanitizeHtml from "sanitize-html";
import { Button } from "@/components/ui/button";
import type { Book } from "../../types";
import { useBookAffiliateLinks } from "../../hooks/use-book-affiliate-links";
import { getLanguageName } from "../../utils/book-utils";
import { Buildings, CalendarBlank, Barcode, Globe, FileText } from "@phosphor-icons/react";

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

      <section className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <InfoPair icon={<Buildings size={16} weight="duotone" />} label="Publisher" value="-" />
        <InfoPair icon={<CalendarBlank size={16} weight="duotone" />} label="Published" value={publishedYear} />
        <InfoPair icon={<Globe size={16} weight="duotone" />} label="Language" value={getLanguageName(book.language)} />
        <InfoPair
          icon={<FileText size={16} weight="duotone" />}
          label="Pages"
          value={book.pageCount ? String(book.pageCount) : "-"}
        />
        <InfoPair 
          icon={<Barcode size={16} weight="duotone" />} 
          label="ISBN" 
          value={book.isbn13 || "-"} 
          className="col-span-2 sm:col-span-4"
        />
      </section>

      {links.length > 0 && (
        <section className="space-y-3 mt-6">
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

function InfoPair({ label, value, icon, className }: { label: string; value: string; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-1 flex-col justify-between gap-2.5 rounded-xl border border-border-subtle/50 bg-card/20 p-3 shadow-sm transition-colors hover:border-border-subtle hover:bg-muted/30 ${className || ""}`}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon && <div className="flex items-center justify-center rounded-md bg-muted/70 p-1 text-foreground/80">{icon}</div>}
        <p className="text-[10px] font-mono uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium text-foreground sm:text-base wrap-break-words">
        {value}
      </p>
    </div>
  );
}
