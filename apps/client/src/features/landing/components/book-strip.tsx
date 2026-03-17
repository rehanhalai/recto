import React from "react";
import { cn } from "@/lib/utils";

const BOOK_COVERS = {
  harry_potter: "/landingPage/books/harry_potter_sorcerers_stone.webp",
  ninetine_eighty_four: "/landingPage/books/1984.webp", // 1984 as fallback/replacement if mock is missing
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
  const coversArray = Object.values(BOOK_COVERS);
  const half = Math.ceil(coversArray.length / 2);

  // Split into two halves
  const firstHalf = coversArray.slice(0, half);
  const secondHalf = coversArray.slice(half);

  // Duplicate for infinite scroll effect
  const row1 = [...firstHalf, ...firstHalf];
  const row2 = [...secondHalf, ...secondHalf];

  // Return early if no covers
  if (coversArray.length === 0) {
    return null;
  }

  return (
    <div
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

        .book-strip-row:hover {
          animation-play-state: paused;
        }

        .book-strip-row-1 {
          animation: scroll-left 40s linear infinite;
        }

        .book-strip-row-2 {
          animation: scroll-right 55s linear infinite;
        }

        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .book-cover {
          width: 80px;
          height: 120px;
          object-fit: cover;
          border-radius: 4px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          flex-shrink: 0;
        }
      `}</style>

      {/* Row 1: Scrolls Left */}
      <div className="book-strip-row book-strip-row-1">
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

      {/* Row 2: Scrolls Right */}
      <div className="book-strip-row book-strip-row-2">
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
  );
};

export default BookStrip;
