import { Footer } from "@/components/layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "",
  description:
    "Discover your next great read with curated book recommendations, trending lists, and insightful blogs.",
};

export default function bookLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
