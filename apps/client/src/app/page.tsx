import type { Metadata } from "next";
import LandingPageClient from "./landing-page-client";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://recto.social";
const landingDescription =
  "Recto is a social reading platform where you track books, share reviews, follow readers you trust, and discover meaningful recommendations.";

export const metadata: Metadata = {
  title: "Recto | Social Reading Platform",
  description: landingDescription,
  keywords: [
    "social reading platform",
    "book tracking",
    "book reviews",
    "curated reading lists",
    "discover books",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Recto | Social Reading Platform",
    description: landingDescription,
    url: siteUrl,
    type: "website",
    siteName: "Recto",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recto | Social Reading Platform",
    description: landingDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPage() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Recto",
    url: siteUrl,
    description: landingDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <LandingPageClient />
    </>
  );
}
