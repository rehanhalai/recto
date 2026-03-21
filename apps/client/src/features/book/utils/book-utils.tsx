import { StarIcon, StarHalfIcon } from "@phosphor-icons/react";

export function getBookInitials(title: string) {
  const words = title.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w.charAt(0).toUpperCase()).join("") || "BK";
}

export function renderStars(rating: number) {
  return Array.from({ length: 5 }).map((_, i) => {
    const star = i + 1;
    if (rating >= star) {
      return (
        <StarIcon key={i} size={14} weight="fill" className="text-amber-400" />
      );
    }
    if (rating >= star - 0.5) {
      return (
        <StarHalfIcon
          key={i}
          size={14}
          weight="fill"
          className="text-amber-400"
        />
      );
    }
    return <StarIcon key={i} size={14} className="text-amber-400/40" />;
  });
}

export function getHighResCover(coverUrl: string | null | undefined): string | undefined {
  if (!coverUrl) return undefined;
  return coverUrl.replace("zoom=1", "zoom=2").replace("L", "M");
}
