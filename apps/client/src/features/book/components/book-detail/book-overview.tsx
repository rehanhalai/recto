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
  const links = affiliateData?.data?.links ? Object.values(affiliateData.data.links) : [];

  return (
    <div className="space-y-10">
      {/* Description Section */}
      <section className="space-y-6">
        <div
          className="font-serif text-[1.15rem] leading-[1.7] tracking-normal text-ink/90 sm:text-xl"
          style={
            expanded || !hasLongDescription
              ? undefined
              : {
                  display: "-webkit-box",
                  WebkitLineClamp: 5,
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
            variant="ghost"
            className="flex items-center gap-2 p-0 h-auto text-ink-muted hover:text-foreground transition-colors hover:bg-transparent"
            onClick={() => setExpanded((v) => !v)}
          >
            <span className="text-base font-serif italic border-b border-border-subtle/60 leading-tight">
              {expanded ? "Read less ↑" : "Read full description ↓"}
            </span>
          </Button>
        )}
      </section>

      {/* Metadata Detail Box */}
      <section className="grid overflow-hidden rounded-xl border border-border-subtle/50 bg-card/10 sm:grid-cols-2 divide-y divide-border-subtle/40 sm:divide-y-0 sm:divide-x dark:bg-card/5">
        <div className="flex flex-col gap-1.5 p-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted/70">
            Language
          </span>
          <span className="font-serif text-lg text-foreground">
            {getLanguageName(book.language)}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 p-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted/70">
            ISBN
          </span>
          <span className="font-serif text-lg text-foreground">
            {book.isbn13 || "—"}
          </span>
        </div>
      </section>

      {/* Buy Options */}
      {links.length > 0 && (
        <section className="space-y-4 pt-4">
          <h4 className="font-serif text-lg italic text-ink-muted/90">
            Available at
          </h4>
          <div className="flex flex-wrap gap-3">
            {(links as any[]).map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-border-subtle/50 bg-card/20 px-5 py-3 text-sm font-medium transition-all hover:bg-card/40 hover:border-border-subtle"
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
