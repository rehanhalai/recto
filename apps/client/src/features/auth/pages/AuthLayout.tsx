"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import rectoLogoDark from "@recto/assets/logos/recto-logo-dark.webp";
import rectoLogoLight from "@recto/assets/logos/recto-logo-light.webp";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  topSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  mobileShowLogoForTitle?: boolean;
}

const quotes = [
  {
    text: "A reader lives a thousand lives before he dies.",
    author: "George R.R. Martin",
  },
  {
    text: "Not all those who wander are lost.",
    author: "J.R.R. Tolkien",
  },
  {
    text: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway",
  },
  {
    text: "I have always imagined that paradise will be a kind of library.",
    author: "Jorge Luis Borges",
  },
];

export function AuthLayout({
  children,
  title,
  topSlot,
  footerSlot,
  mobileShowLogoForTitle = false,
}: AuthLayoutProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkMode = currentTheme === "dark";
  const logoSrc = !mounted
    ? rectoLogoLight
    : isDarkMode
      ? rectoLogoLight
      : rectoLogoDark;

  const mosaicBlocks = useMemo(
    () => Array.from({ length: 35 }, (_, index) => index),
    [],
  );

  return (
    <div className="min-h-screen bg-[#f8f4ec] text-[#1f1a16] md:grid md:grid-cols-[0.95fr_1.05fr] lg:grid-cols-[0.85fr_1.15fr] dark:bg-[#15120e] dark:text-[#f4eee5]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#12100d] p-10 text-[#f1e8da] md:flex md:flex-col md:justify-between">
        <div className="pointer-events-none absolute inset-0 -rotate-3 scale-[1.12] opacity-15">
          <div className="grid h-full grid-cols-5 gap-[3px]">
            {mosaicBlocks.map((index) => (
              <div
                key={index}
                className="rounded-[2px]"
                style={{
                  background:
                    index % 11 === 0
                      ? "#9d7b3b"
                      : index % 7 === 0
                        ? "#bda638"
                        : index % 5 === 0
                          ? "#cd9f6e"
                          : index % 3 === 0
                            ? "#7f9554"
                            : "#c5a067",
                }}
              />
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-[#12100d]/55 to-[#12100d]" />

        <div className="relative z-10 flex items-center">
          <Image
            src={rectoLogoLight}
            alt="Recto"
            priority
            width={140}
            height={40}
            className="h-8 w-auto"
          />
        </div>

        <div className="relative z-10 max-w-md">
          <p className="font-serif text-3xl italic leading-tight text-[#f4eee4] transition-all duration-700">
            &ldquo;{quotes[quoteIndex].text}&rdquo;
          </p>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px w-7 bg-[#c7a15f]" />
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#c7a15f]">
              {quotes[quoteIndex].author}
            </span>
          </div>
          <div className="mt-5 flex items-center gap-2">
            {quotes.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show quote ${index + 1}`}
                onClick={() => setQuoteIndex(index)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  quoteIndex === index ? "bg-[#c7a15f]" : "bg-[#3a332a]"
                }`}
              />
            ))}
          </div>
        </div>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-md">
          <div
            className={`mb-10 items-center md:hidden ${
              mobileShowLogoForTitle ? "hidden" : "flex"
            }`}
          >
            <Image
              src={logoSrc}
              alt="Recto"
              priority
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          <div className="rounded-2xl border border-[#e3d7c5] bg-[#f3ebdf]/75 p-6 shadow-[0_14px_40px_rgba(30,24,18,0.08)] backdrop-blur sm:p-8 dark:border-[#2c251d] dark:bg-[#1a1611]/80 dark:shadow-none">
            {topSlot}
            <header className="mb-7">
              {mobileShowLogoForTitle ? (
                <>
                  <div className="mb-2 flex justify-center md:hidden">
                    <Image
                      src={logoSrc}
                      alt="Recto"
                      priority
                      width={140}
                      height={40}
                      className="h-12 w-auto"
                    />
                  </div>
                  <h1 className="hidden font-serif text-center text-4xl leading-tight tracking-tight text-[#1f1a16] md:block dark:text-[#f4eee4]">
                    {title}
                  </h1>
                </>
              ) : (
                <h1 className="font-serif text-center text-4xl leading-tight tracking-tight text-[#1f1a16] dark:text-[#f4eee4]">
                  {title}
                </h1>
              )}
            </header>
            {children}
            {footerSlot}
          </div>
        </div>
      </main>
    </div>
  );
}
