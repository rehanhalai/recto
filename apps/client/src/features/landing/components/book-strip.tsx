"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

const BookStrip: React.FC<BookStripProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for scroll-based responsive movement
  const scrollRow1Ref = useRef<HTMLDivElement>(null);
  const scrollRow2Ref = useRef<HTMLDivElement>(null);

  // Refs for base infinite idle movement
  const idleRow1Ref = useRef<HTMLDivElement>(null);
  const idleRow2Ref = useRef<HTMLDivElement>(null);

  const coversArray = Object.values(BOOK_COVERS);
  const half = Math.ceil(coversArray.length / 2);

  const firstHalf = coversArray.slice(0, half);
  const secondHalf = coversArray.slice(half);

  // Repeat covers enough times to fill any screen width (30+ items)
  // This prevents the "black space" gap on wide monitors
  const fillRow = (arr: string[]) => {
    let result = [...arr];
    while (result.length < 30) {
      result = [...result, ...arr];
    }
    return result;
  };

  const row1 = fillRow(firstHalf);
  const row2 = fillRow(secondHalf);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // 1. IDLE MOVEMENT (Constant drift)
      // Row 1 drifts Left slowly
      gsap.to(idleRow1Ref.current, {
        x: "-50%",
        duration: 50,
        repeat: -1,
        ease: "none",
      });

      // Row 2 drifts Right slowly (starts at -50% and moves to 0)
      gsap.fromTo(
        idleRow2Ref.current,
        { x: "-50%" },
        {
          x: "0%",
          duration: 65,
          repeat: -1,
          ease: "none",
        },
      );

      // 2. SCROLL RESPONSE (Reactive parallax)
      // We use a smaller distance (e.g., -200px) so it feels subtle and premium
      // Row 1: Extra push Left
      gsap.to(scrollRow1Ref.current, {
        x: -200,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5, // Higher scrub for smoother, delayed response
        },
      });

      // Row 2: Extra push Right
      gsap.to(scrollRow2Ref.current, {
        x: 200,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    },
    { scope: containerRef },
  );

  if (coversArray.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "book-strip-container w-full overflow-hidden flex flex-col gap-4",
        className,
      )}
    >
      <style>{`
        .book-strip-container {
          position: relative;
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }

        .book-strip-row {
          display: flex;
          gap: 16px;
          white-space: nowrap;
          width: fit-content;
        }

        .book-cover {
          width: 80px;
          height: 120px;
          object-fit: cover;
          border-radius: 4px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          flex-shrink: 0;
          will-change: transform;
        }
      `}</style>

      {/* Row 1: Scrolls Left */}
      <div ref={scrollRow1Ref}>
        <div ref={idleRow1Ref} className="book-strip-row">
          {row1.map((url, i) => (
            <img
              key={`r1-${i}`}
              src={url}
              alt="Book Cover"
              className="book-cover"
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {/* Row 2: Scrolls Right */}
      <div ref={scrollRow2Ref}>
        <div ref={idleRow2Ref} className="book-strip-row">
          {row2.map((url, i) => (
            <img
              key={`r2-${i}`}
              src={url}
              alt="Book Cover"
              className="book-cover"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookStrip;
