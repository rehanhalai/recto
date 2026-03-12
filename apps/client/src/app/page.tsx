"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/fetch";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroScrollSequence } from "../features/landing/components/hero-scroll-sequence";
import useLenis from "@/utils/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  useLenis();

  const checkAuth = useCallback(async () => {
    try {
      const res = await apiFetch<{ success: boolean }>("/user/whoami");
      if (res.success) {
        router.replace("/home");
      } else {
        setCheckingAuth(false);
      }
    } catch {
      setCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (checkingAuth) return;

    const ctx = gsap.context(() => {
      gsap.to("nav", {
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "+=200",
          scrub: true,
        },
        opacity: 0,
        pointerEvents: "none",
        duration: 0.3,
      });
      gsap.from(".paper-section h2", {
        scrollTrigger: {
          trigger: ".paper-section",
          start: "top 80%",
        },
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".paper-section p", {
        scrollTrigger: {
          trigger: ".paper-section",
          start: "top 70%",
        },
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      });

      // Parallax effect for paper background
      gsap.to("main", {
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
        backgroundPositionY: "20%",
        ease: "none",
      });
    });

    return () => ctx.revert();
  }, [checkingAuth]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-ink/15 border-t-ink/60 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold/30 selection:text-white">
      {/* Texture Overlays */}
      <div className="fixed inset-0 pointer-events-none z-100 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <Navbar />
      <main className="relative bg-black">
        <HeroScrollSequence />

        {/* Thematic Content to Carry On the Scroll */}
        <section className="paper-section min-h-screen flex flex-col items-center justify-center px-6 py-32 text-center relative z-10 bg-black text-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-linear-to-b from-gold/40 to-transparent" />
          
          <span className="text-xs uppercase tracking-[0.4em] text-white/60 mb-8 block font-medium">
            The Digital Library Reimagined
          </span>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl max-w-6xl tracking-tight leading-[0.9] mb-16 font-serif">
            Where every story <br />
            <span className="italic text-gold px-4 font-normal">
              finds
            </span>
            <br />
            its rightful space.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mt-12 text-left border-t border-white/10 pt-16">
            <div className="space-y-4">
              <span className="text-gold font-serif italic text-2xl">01</span>
              <h3 className="text-xl font-semibold">Tactile Feel</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Experience the warmth of physical books through a carefully
                crafted digital interface that respects the medium.
              </p>
            </div>
            <div className="space-y-4">
              <span className="text-gold font-serif italic text-2xl">02</span>
              <h3 className="text-xl font-semibold">Pure Focus</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                A reading environment stripped of distractions, designed to let
                the words take center stage.
              </p>
            </div>
            <div className="space-y-4">
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
