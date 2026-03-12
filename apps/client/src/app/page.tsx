"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/fetch";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroScrollSequence } from "../features/landing/components/hero-scroll-sequence";
import { CustomCursor } from "../features/landing/components/custom-cursor";
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
          end: "+=50",
          scrub: true,
        },
        opacity: 0,
        pointerEvents: "none",
        duration: 0.3,
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
    <div className="min-h-screen bg-paper text-ink cursor-none">
      <CustomCursor />
      <Navbar />
      <main>
        <HeroScrollSequence />
      </main>
      <Footer />
    </div>
  );
}
