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
        state?: { isAuthenticated?: boolean; user?: { id?: string | null } | null };
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
          state?: { isAuthenticated?: boolean; user?: { id?: string | null } | null };
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

          <div className="paper-feature mb-6 sm:mb-10">
            <Link
              href="/feed"
              className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-6 py-3 text-sm font-medium tracking-wide text-gold transition-colors hover:bg-gold hover:text-black"
            >
              Start Exploring
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mt-10 md:mt-12 text-left border-t border-white/10 pt-10 md:pt-16">
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
      </main>
      <Footer />
    </div>
  );
}
