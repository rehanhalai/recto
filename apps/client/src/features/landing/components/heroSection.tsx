"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BookMarquee3D } from "./book-marquee-3d";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

export function HeroSection({ isDesktop }: { isDesktop: boolean }) {
  const heroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroTextRef.current) {
      gsap.to(heroTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power3.out",
        delay: 0.5,
      });
    }
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col md:flex-row items-center pt-24 md:pt-0">
      {/* Animated Grid Background */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.2}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[160%] skew-y-12 fill-white/5 stroke-white/5"
        )}
      />

      {/* Left Side: Hero Text */}
      <div
        ref={heroTextRef}
        className="w-full md:w-1/2 flex flex-col justify-center px-8 md:pl-16 lg:pl-24 z-20 opacity-0 translate-y-4 order-1 md:order-1"
      >
        <div className="space-y-6 max-w-xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.1] tracking-tight text-white drop-shadow-xl">
            A reading life <br />
            <span className="italic text-gold font-normal">
              worth showing off.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light max-w-md drop-shadow-md">
            Track your books, share your taste, and discover what to read next
            — all in one place designed to actually look good.
          </p>
        </div>
      </div>

      {/* Right Side: 3D Marquee */}
      {isDesktop && (
        <div className="hidden md:flex w-full md:w-1/2 h-[500px] md:h-screen items-center justify-center relative z-10 order-2 md:order-2 mt-10 md:mt-0">
          <BookMarquee3D />
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="scroll-indicator absolute bottom-8 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center gap-6 pointer-events-none hidden md:flex">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse"
          />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
            Scroll to explore
          </span>
        </div>
      </div>
    </div>
  );
}
