import { StandardLayout } from "@/components/layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Recto",
  description:
    "Discover your next great read with curated book recommendations, trending lists, and insightful blogs.",
};

type SearchLayoutProps = {
  children: React.ReactNode;
};

export default function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <StandardLayout variant="two-column">
      {children}
    </StandardLayout>
  );
}
