"use client";

import { BookMarquee3D } from "./book-marquee-3d";
import { AnimatedGridPattern } from "@recto/ui";
import { cn } from "@/lib/utils";
import { Button } from "@recto/ui";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col justify-center md:flex-row items-center pt-16 md:pt-0">
      {/* Animated Grid Background */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.2}
        duration={3}
        repeatDelay={1}
        className={cn(
          "mask-[radial-gradient(800px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[160%] skew-y-12 fill-white/5 stroke-white/5"
        )}
      />

      {/* Left Side: Hero Text */}
      <div
        className="w-full md:w-1/2 flex flex-col justify-center px-8 md:pl-16 lg:pl-24 z-20 order-1 md:order-1"
      >
        <div className="space-y-6 max-w-xl flex flex-col items-center md:items-start text-center md:text-left">
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
          <div className="flex gap-4 items-center">
            <Button onClick={() => router.push("/browse")}> Explore </Button>
            <Button
              variant="outline"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side: 3D Marquee */}
          <div className="hidden md:flex w-full md:w-1/2 h-125 md:h-screen items-center justify-center relative z-10 order-2 md:order-2 mt-10 md:mt-0">
            <BookMarquee3D />
          </div>
    </div>
  );
}
