import type { Metadata, Viewport } from "next";
import {
  Geist_Mono,
  Playfair_Display,
  Cormorant_Garamond,
  DM_Sans,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Providers from "@/provider";
import { PwaRegister } from "@/components/pwa-register";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://recto.social";

const previewImageUrl =
  "https://res.cloudinary.com/dkfdpa4n3/image/upload/c_pad,b_white,ar_1200:630,w_1200,h_630,f_auto,q_auto/v1774618345/recto/posts/aqqcjvpgabtnnivuepvd.webp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Recto",
  title: "Recto — Discover Your Next Great Read",
  description:
    "A social reading platform for people who take books seriously. Track what you've read, discover what's next, and connect with readers who get it.",
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    title: "Recto — Discover Your Next Great Read",
    description:
      "A social reading platform for people who take books seriously. Track what you've read, discover what's next, and connect with readers who get it.",
    url: siteUrl,
    siteName: "Recto",
    type: "website",
    images: [
      {
        url: previewImageUrl,
        width: 1200,
        height: 630,
        alt: "Recto social preview banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recto — Discover Your Next Great Read",
    description:
      "A social reading platform for people who take books seriously. Track what you've read, discover what's next, and connect with readers who get it.",
    images: [previewImageUrl],
  },
  appleWebApp: {
    capable: true,
    title: "Recto",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#171717",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
