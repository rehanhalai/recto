"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

const BOOK_COVERS = {
  harry_potter: "/landingPage/books/harry_potter_sorcerers_stone.webp",
  ninetine_eighty_four: "/landingPage/books/1984.webp",
  great_gatsby: "/landingPage/books/the_great_gatsby.webp",
  pride_prejudice: "/landingPage/books/pride_and_prejudice.webp",
  alchemist: "/landingPage/books/the_alchemist.webp",
  little_prince: "/landingPage/books/the_little_prince.webp",
  normal_people: "/landingPage/books/normal_people.webp",
  secret_history: "/landingPage/books/the_secret_history.webp",
  piranesi: "/landingPage/books/piranesi.webp",
  babel: "/landingPage/books/babel.webp",
  midnight_library: "/landingPage/books/the_midnight_library.webp",
  pachinko: "/landingPage/books/pachinko.webp",
  circe: "/landingPage/books/circe.webp",
  klara_sun: "/landingPage/books/klara_and_the_sun.webp",
  achilles: "/landingPage/books/the_song_of_achilles.webp",
  ends_with_us: "/landingPage/books/it_ends_with_us.webp",
  fourth_wing: "/landingPage/books/fourth_wing.webp",
  tomorrow: "/landingPage/books/tomorrow_and_tomorrow.webp",
  sapiens: "/landingPage/books/sapiens.webp",
  atomic_habits: "/landingPage/books/atomic_habits.webp",
  educated: "/landingPage/books/educated.webp",
  hail_mary: "/landingPage/books/project_hail_mary.webp",
};

interface BookStripProps {
  className?: string;
}

const BookCard = ({ url }: { url: string }) => {
  return (
    <img
      src={url}
      alt="Book Cover"
      className="h-[120px] w-[80px] shrink-0 rounded object-cover shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]"
      loading="lazy"
    />
  );
};

const BookStrip: React.FC<BookStripProps> = ({ className }) => {
  const coversArray = Object.values(BOOK_COVERS);

  if (coversArray.length === 0) {
    return null;
  }

  const half = Math.ceil(coversArray.length / 2);
  const firstRow = coversArray.slice(0, half);
  const secondRow = coversArray.slice(half);

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden gap-4",
        className,
      )}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
      }}
    >
      <Marquee pauseOnHover className="[--duration:35s]">
        {firstRow.map((url, i) => (
          <BookCard key={`r1-${i}`} url={url} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:35s]">
        {secondRow.map((url, i) => (
          <BookCard key={`r2-${i}`} url={url} />
        ))}
      </Marquee>
    </div>
  );
};

export default BookStrip;
