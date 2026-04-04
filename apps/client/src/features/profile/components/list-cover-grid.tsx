import Image from "next/image";

type ListCoverGridProps = {
  covers: string[];
  size?: string;
};

export function ListCoverGrid({
  covers,
  size = "h-14 w-14",
}: ListCoverGridProps) {
  const displayCovers = (covers ?? []).slice(0, 4);

  return (
    <div
      className={`grid aspect-square ${size} shrink-0 overflow-hidden rounded-md border border-border-subtle bg-paper grid-cols-2 grid-rows-2`}
    >
      {displayCovers.map((cover, i) => (
        <div
          key={`${cover}-${i}`}
          className="relative h-full w-full border-[0.5px] border-border-subtle/10"
        >
          <Image
            src={cover}
            alt="Cover"
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      ))}
      {/* Fill empty slots if less than 4 covers */}
      {Array.from({ length: Math.max(0, 4 - displayCovers.length) }).map(
        (_, i) => (
          <div
            key={`empty-${displayCovers.length + i}`}
            className="bg-card-surface/30 border-[0.5px] border-border-subtle/10"
          />
        ),
      )}
    </div>
  );
}
