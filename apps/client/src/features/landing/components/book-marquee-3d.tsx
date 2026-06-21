"use client";

import React from "react";
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

const coversArray = Object.values(BOOK_COVERS);

const rowLength = Math.ceil(coversArray.length / 4);
const firstRow = coversArray.slice(0, rowLength);
const secondRow = coversArray.slice(rowLength, rowLength * 2);
const thirdRow = coversArray.slice(rowLength * 2, rowLength * 3);
const fourthRow = coversArray.slice(rowLength * 3);

const BookCard = ({ url }: { url: string }) => {
  return (
    <img
      src={url}
      alt="Book Cover"
      className="h-[180px] w-[120px] shrink-0 rounded object-cover shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]"
      loading="lazy"
    />
  );
};

export function BookMarquee3D() {
  return (
    <div className="relative flex h-full min-h-[600px] w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:400px]">
      <div
        className="flex flex-row items-center gap-4"
        style={{
          transform:
            "translateX(-50px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
        }}
      >
        <Marquee pauseOnHover vertical className="[--duration:40s]">
          {firstRow.map((url, i) => (
            <BookCard key={`r1-${i}`} url={url} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:40s]" vertical>
          {secondRow.map((url, i) => (
            <BookCard key={`r2-${i}`} url={url} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:40s]" vertical>
          {thirdRow.map((url, i) => (
            <BookCard key={`r3-${i}`} url={url} />
          ))}
        </Marquee>
        <Marquee pauseOnHover className="[--duration:40s]" vertical>
          {fourthRow.map((url, i) => (
            <BookCard key={`r4-${i}`} url={url} />
          ))}
        </Marquee>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black via-black/50 to-transparent"></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black to-transparent"></div>
    </div>
  );
}