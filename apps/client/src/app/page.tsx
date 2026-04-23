"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/layout/footer";
import rectoLogoLight from "@recto/assets/logos/recto-logo-light.webp";
import { HeroScrollSequence } from "../features/landing/components/hero-scroll-sequence";
import BookStrip from "../features/landing/components/book-strip";
import useLenis from "@/utils/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Global ScrollTrigger optimization
if (typeof window !== "undefined") {
  ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    syncInterval: 100,
    limitCallbacks: true,
  });
}

export default function LandingPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  useLenis();

  useEffect(() => {
    try {
      const persistedAuth = localStorage.getItem("auth-storage");

      if (!persistedAuth) {
        setCheckingAuth(false);
        return;
      }

      const parsed = JSON.parse(persistedAuth) as {
        state?: {
          isAuthenticated?: boolean;
          user?: { id?: string | null } | null;
        };
      };

      const hasAuth = Boolean(
        parsed?.state?.isAuthenticated && parsed?.state?.user?.id,
      );

      if (hasAuth) {
        router.replace("/feed");
        return;
      }

      setCheckingAuth(false);
    } catch {
      setCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "auth-storage") {
        return;
      }

      if (!event.newValue) {
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue) as {
          state?: {
            isAuthenticated?: boolean;
            user?: { id?: string | null } | null;
          };
        };

        const hasAuth = Boolean(
          parsed?.state?.isAuthenticated && parsed?.state?.user?.id,
        );

        if (hasAuth) {
          router.replace("/feed");
        }
      } catch {
        // Ignore malformed localStorage payloads.
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [router]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (checkingAuth) return;

    const section = document.querySelector<HTMLElement>(".paper-section");
    if (!section) return;

    const heading = section.querySelector<HTMLElement>("h2");
    const subtitle = section.querySelector<HTMLElement>(".paper-subtitle");
    const featureCards = Array.from(
      section.querySelectorAll<HTMLElement>(".paper-feature"),
    );

    if (!heading || !subtitle || featureCards.length === 0) return;

    const ctx = gsap.context(() => {
      if (!isDesktop) {
        // Mobile/tablet fallback: keep content visible and skip entrance effects.
        gsap.set([subtitle, heading, ...featureCards], {
          opacity: 1,
          y: 0,
          clearProps: "transform",
        });
        return;
      }

      gsap.set([subtitle, heading, ...featureCards], { opacity: 0, y: 26 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        })
        .to(subtitle, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        })
        .to(
          heading,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.1",
        )
        .to(
          featureCards,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.15",
        );
    }, section);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [checkingAuth, isDesktop]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/15 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold/30 selection:text-white">
      {/* Floating Logo */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/feed" className="flex items-center group">
          <Image
            src={rectoLogoLight}
            alt="Recto"
            width={100}
            height={32}
            className="h-7 w-auto opacity-90 hover:opacity-100 transition-opacity duration-200"
          />
        </Link>
      </div>

      <main className="relative bg-black">
        <HeroScrollSequence />

        {/* Dynamic Book Strip Transition */}
        <div className="py-20 bg-black overflow-hidden relative z-20">
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gold/20 to-transparent" />
          <BookStrip />
          <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gold/20 to-transparent" />
        </div>

        {/* Thematic Content to Carry On the Scroll */}
        <section className="paper-section min-h-screen flex flex-col items-center justify-center px-5 sm:px-6 py-20 md:py-32 text-center relative z-10 bg-black text-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-linear-to-b from-gold/40 to-transparent" />

          <span className="paper-subtitle text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.4em] text-white/60 mb-6 sm:mb-8 block font-medium">
            The Digital Library Reimagined
          </span>

          <h2 className="text-5xl md:text-7xl lg:text-8xl max-w-6xl tracking-tight leading-[0.95] sm:leading-[0.9] mb-10 sm:mb-16 font-serif">
            Where every story <br />
            <span className="italic text-gold px-4 font-normal">finds</span>
            <br />
            its rightful space.
          </h2>

          <div className="paper-feature mb-8 sm:mb-12 w-full max-w-3xl">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-gold/25 bg-linear-to-b from-gold/[0.08] via-white/[0.02] to-transparent px-6 py-7 sm:px-9 sm:py-10 shadow-[0_14px_44px_rgba(255,203,107,0.08)]">
              <div className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-linear-to-r from-transparent via-gold/45 to-transparent" />
              <div className="pointer-events-none absolute left-8 right-8 bottom-0 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />

              <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 text-center">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.32em] text-gold/85">
                  Continue to your reading circle
                </span>

                <h3 className="text-2xl sm:text-3xl md:text-[2.1rem] leading-tight font-serif text-white">
                  Return to the books that move you.
                </h3>

                <p className="max-w-xl text-sm sm:text-base leading-relaxed text-white/65">
                  Step into your feed for thoughtful recommendations, reader
                  conversations, and the next pages in your journey.
                </p>

                <Link
                  href="/feed"
                  className="inline-flex items-center justify-center rounded-full border border-gold/60 bg-gold/16 px-7 py-3 text-sm font-semibold tracking-[0.06em] text-gold transition-all hover:bg-gold hover:text-black hover:shadow-[0_10px_24px_rgba(255,203,107,0.24)]"
                >
                  Enter Your Feed
                </Link>
              </div>
            </div>
          </div>

          <div
            id="features"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mt-10 md:mt-12 text-left border-t border-white/10 pt-10 md:pt-16"
          >
            <div className="paper-feature space-y-4">
              <span className="text-gold font-serif italic text-2xl">01</span>
              <h3 className="text-xl font-semibold">Tactile Feel</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Experience the warmth of physical books through a carefully
                crafted digital interface that respects the medium.
              </p>
            </div>
            <div className="paper-feature space-y-4">
              <span className="text-gold font-serif italic text-2xl">02</span>
              <h3 className="text-xl font-semibold">Pure Focus</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                A reading environment stripped of distractions, designed to let
                the words take center stage.
              </p>
            </div>
            <div className="paper-feature space-y-4">
              <span className="text-gold font-serif italic text-2xl">03</span>
              <h3 className="text-xl font-semibold">Deep Archival</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Connect your collections across formats into one beautiful,
                searchable, and timeless archive.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-10 px-5 sm:px-6 pb-16 sm:pb-20 bg-black text-white">
          <div className="mx-auto max-w-6xl border-y border-white/10 py-14 sm:py-16">
            <div className="text-center mb-10 sm:mb-12">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold/80">
                How Recto Works
              </span>
              <h3 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-serif leading-tight">
                A calmer rhythm for serious readers.
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <span className="text-gold font-serif italic text-2xl">01</span>
                <h4 className="mt-3 text-xl font-semibold">
                  Shape Your Shelves
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  Organize titles across wishlist, currently reading, and
                  finished while preserving a clear record of your reading life.
                </p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <span className="text-gold font-serif italic text-2xl">02</span>
                <h4 className="mt-3 text-xl font-semibold">Read In Company</h4>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  Share reflections, publish ratings, and follow readers whose
                  literary taste consistently resonates with yours.
                </p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <span className="text-gold font-serif italic text-2xl">03</span>
                <h4 className="mt-3 text-xl font-semibold">
                  Discover With Intention
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  Explore a feed guided by real reader momentum, searchable
                  collections, and carefully curated lists.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="relative z-10 px-5 sm:px-6 pb-20 sm:pb-28 bg-black text-white">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-start">
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold/80">
                Platform Highlights
              </span>
              <h3 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-serif leading-tight max-w-xl">
                The complete platform for a meaningful reading life.
              </h3>
              <p className="mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-white/65">
                Recto blends social discovery with practical reading tools for
                readers who value depth, curation, and authentic book culture.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-gold/90">
                  Social Feed
                </span>
                <span className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-gold/90">
                  Smart Search
                </span>
                <span className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-gold/90">
                  Reviews & Ratings
                </span>
                <span className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-gold/90">
                  Curated Lists
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-linear-to-b from-white/[0.06] to-white/[0.02] p-6 sm:p-8">
              <h4 className="text-xl sm:text-2xl font-serif">
                Why Recto feels different
              </h4>
              <ul className="mt-6 space-y-5 text-sm sm:text-base text-white/70">
                <li className="border-l-2 border-gold/45 pl-4">
                  Unified discovery across readers, books, and lists through one
                  clear search experience.
                </li>
                <li className="border-l-2 border-gold/45 pl-4">
                  A feed centered on genuine reader activity, not shallow,
                  algorithm-first recommendation loops.
                </li>
                <li className="border-l-2 border-gold/45 pl-4">
                  Cookie-based authentication with server-side session
                  validation for stronger account safety.
                </li>
                <li className="border-l-2 border-gold/45 pl-4">
                  Flexible shelf tracking from wishlist to finished, so progress
                  stays visible at every step.
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/feed"
                  className="inline-flex items-center rounded-full border border-gold/55 bg-gold/12 px-6 py-3 text-sm font-semibold tracking-[0.06em] text-gold transition-colors hover:bg-gold hover:text-black"
                >
                  Start Reading on Recto
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
