"use client";

import Image from "next/image";
import { useState } from "react";
import { StarIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useBookByCard } from "../hooks/useBook";
import { BookDetailSkeleton } from "./book-detail-skeleton";

interface BookDetailProps {
  volumeId: string;
  title: string;
  authors?: string[];
}

export function BookDetail({ volumeId, title, authors }: BookDetailProps) {
  const [coverError, setCoverError] = useState(false);

  const {
    data: currentBook,
    isLoading: isBookLoading,
    error: bookError,
  } = useBookByCard({ volumeId });

  // Show loading skeleton while fetching or before book data arrives
  if (isBookLoading) {
    return <BookDetailSkeleton />;
  }

  // Show error with retry button
  if (bookError) {
    return (
      <div className="text-center py-20">
        <div className="mb-4 text-muted-foreground">
          <p className="text-lg font-semibold">Unable to load book</p>
          <p className="text-sm mt-2">{bookError.message}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Only show "not found" after loading completes with no book and no error
  if (!currentBook) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Book not found
      </div>
    );
  }

  const pages = currentBook.pageCount || 0;
  const firstAuthor = Array.isArray(currentBook.authors)
    ? typeof currentBook.authors[0] === "string"
      ? currentBook.authors[0]
      : currentBook.authors[0]?.authorName
    : undefined;
  // const ratingCount = currentBook.ratingsCount ?? reviews.length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
        <div className="flex flex-row md:gap-10 gap-4 mb-6">
          <div className="flex-1 min-w-0 flex flex-col justify-start md:justify-center">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(currentBook.genres || []).slice(0, 3).map((g) => (
                <Badge
                  key={g}
                  variant="secondary"
                  className="text-[10px] md:text-xs px-2 py-0.5 md:py-1 font-normal uppercase tracking-wide text-muted-foreground bg-muted/50"
                >
                  {g}
                </Badge>
              ))}
            </div>

            <h1 className="text-2xl md:text-5xl font-bold text-foreground leading-tight mb-1.5 md:mb-2 truncate-multiline-2">
              {currentBook.title}
            </h1>

            <p className="text-sm md:text-xl text-muted-foreground mb-2 md:mb-4">
              by{" "}
              <span className="font-medium text-foreground">
                {firstAuthor || authors?.[0] || "Unknown"}
              </span>
            </p>

            <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex text-amber-400">
                <StarIcon weight="fill" className="w-4 h-4 md:w-5 md:h-5" />
                <span className="ml-1 font-bold text-foreground">
                  {currentBook.averageRating ?? "-"}
                </span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {currentBook.language || "Unknown"}
              </span>
              {pages > 0 && (
                <>
                  <span className="text-muted-foreground hidden sm:inline">
                    •
                  </span>
                  <span className="text-muted-foreground hidden sm:inline">
                    {pages} Pages
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0 w-[100px] md:w-[220px] shadow-lg rounded-md md:rounded-lg overflow-hidden self-start md:self-center aspect-[2/3] relative bg-muted">
            {currentBook.coverImage && !coverError ? (
              <Image
                src={currentBook.coverImage.replace("L", "M")}
                alt={currentBook.title}
                fill
                loading="eager"
                className="object-cover"
                sizes={"(max-width: 768px) 100px, 220px"}
                onError={() => setCoverError(true)}
              />
            ) : (
              <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                No cover
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {/* TODO: Implement status buttons and progress tracking */}
          {/* <div className="grid grid-cols-3 gap-2 md:gap-4 p-1 bg-muted/30 rounded-xl">
            <StatusButton
              active={readingStatus === "wishlist"}
              onClick={() => handleStatusChange("wishlist")}
              icon={<HeartIcon weight={readingStatus === "wishlist" ? "fill" : "bold"} />}
              label="Wishlist"
            />
            <StatusButton
              active={readingStatus === "reading"}
              onClick={() => handleStatusChange("reading")}
              icon={<BookOpenIcon weight={readingStatus === "reading" ? "fill" : "bold"} />}
              label="Reading"
            />
            <StatusButton
              active={readingStatus === "finished"}
              onClick={() => handleStatusChange("finished")}
              icon={<ChecksIcon weight={readingStatus === "finished" ? "fill" : "bold"} />}
              label="Finished"
            />
          </div>

          {readingStatus === "reading" && (
            <div className="bg-card border border-border/50 p-3 rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Progress</span>
                <span className="text-sm font-bold text-primary">{completion}%</span>
              </div>
              <Progress value={completion} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                {pages > 0 ? (
                  <span>Page {Math.floor((pages * completion) / 100)} of {pages}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Progress</span>
                )}
                <span>{completion}%</span>
              </div>
            </div>
          )} */}

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 font-semibold text-base shadow-sm"
              disabled
            >
              Add to List
            </Button>
            <Button size="lg" variant="outline" className="px-4">
              <ShareNetworkIcon size={20} />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full flex border-b border-border bg-transparent p-0 mb-5 rounded-none">
            <TabsTrigger
              value="description"
              className="flex-1 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground text-base transition-all"
            >
              Description
            </TabsTrigger>
            {/* <TabsTrigger
              value="reviews"
              className="flex-1 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground text-base transition-all"
            >
              Reviews
              <span className="ml-1.5 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                {ratingCount > 99 ? "99+" : ratingCount}
              </span>
            </TabsTrigger> */}
          </TabsList>

          <TabsContent
            value="description"
            className="space-y-3 animate-in fade-in slide-in-from-bottom-2"
          >
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
              {currentBook.description || "No description available."}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
              <DetailItem
                label="Languages"
                value={currentBook.language || "Unknown"}
              />
              <DetailItem
                label="Genres"
                value={(currentBook.genres || []).join(", ") || "—"}
              />
            </div>
          </TabsContent>

          {/* TODO: Implement reviews */}
          {/* <TabsContent
            value="reviews"
            className="animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Community Reviews</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
              >
                Write Review
              </Button>
            </div>

            {isReviewsLoading ? (
              <div className="space-y-3">
                <div className="h-16 rounded-lg bg-muted animate-pulse" />
                <div className="h-16 rounded-lg bg-muted animate-pulse" />
              </div>
            ) : !Array.isArray(reviews) || reviews.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No reviews yet.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <ReviewItem
                    key={r._id}
                    user={r.user.userName || r.user.name || "User"}
                    rating={r.rating}
                    time={new Date(r.updatedAt || r.createdAt).toDateString()}
                    text={r.content}
                  />
                ))}
              </div>
            )}
          </TabsContent> */}
        </Tabs>

        {/* TODO: Implement purchase links */}
        {/* {purchaseLinks && Object.keys(purchaseLinks).length > 0 && (
          <div className="mt-8 space-y-2">
            <h4 className="font-semibold text-base">Purchase Links</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(purchaseLinks).map(([group, links]) =>
                Array.isArray(links)
                  ? links.map((link) => (
                      <a
                        key={`${group}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 text-foreground transition"
                      >
                        {link.title}
                      </a>
                    ))
                  : null,
              )}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      <p className="font-medium break-words">{value}</p>
    </div>
  );
}

// TODO: Implement status buttons and progress tracking when ready
// function StatusButton({
//   active,
//   onClick,
//   icon,
//   label,
// }: {
//   active: boolean;
//   onClick: () => void;
//   icon: React.ReactNode;
//   label: string;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`
//         flex flex-col items-center justify-center py-3 rounded-lg transition-all duration-200 relative overflow-hidden group
//         ${
//           active
//             ? "bg-background shadow-sm border border-border text-foreground ring-1 ring-black/5"
//             : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
//         }
//       `}
//     >
//       <span
//         className={`text-xl md:text-2xl mb-1.5 transition-transform ${
//           active ? "scale-110 text-primary" : ""
//         }`}
//       >
//         {icon}
//       </span>
//       <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">
//         {label}
//       </span>
//       {active && (
//         <span className="absolute inset-0 border-2 border-primary/10 rounded-lg pointer-events-none" />
//       )}
//     </button>
//   );
// }

// TODO: Implement reviews when ready
// function ReviewItem({
//   user,
//   rating,
//   time,
//   text,
// }: {
//   user: string;
//   rating: number;
//   time: string;
//   text: string;
// }) {
//   return (
//     <div className="p-3 rounded-lg bg-card border border-border/40">
//       <div className="flex justify-between items-start mb-1.5">
//         <div className="flex items-center gap-2">
//           <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
//             {user.charAt(0)}
//           </div>
//           <span className="text-sm font-medium">{user}</span>
//         </div>
//         <span className="text-xs text-muted-foreground">{time}</span>
//       </div>
//       <div className="flex text-amber-400 mb-1.5">
//         {[...Array(5)].map((_, i) => (
//           <StarIcon
//             key={i}
//             weight={i < rating ? "fill" : "bold"}
//             className="w-3 h-3"
//           />
//         ))}
//       </div>
//       <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
//     </div>
//   );
// }
