"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 120;

export function HeroScrollSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const frameSources = useMemo(
    () =>
      Array.from(
        { length: TOTAL_FRAMES },
        (_, i) => `/frames/frame_${String(i + 1).padStart(4, "0")}.webp`,
      ),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const images: HTMLImageElement[] = [];
    const playhead = { frame: 0 };
    let loadedCount = 0;

    const drawFrame = (index: number) => {
      const img = images[index];
      if (!img || !img.complete) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr; // logical pixels
      const height = canvas.height / dpr;

      context.fillStyle = "#FDFCFB";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.max(
        width / img.naturalWidth,
        height / img.naturalHeight,
      );
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const x = (width - w) / 2;
      const y = (height - h) / 2;

      context.save();
      context.scale(dpr, dpr);
      context.drawImage(img, x, y, w, h);
      context.restore();
    };

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      drawFrame(Math.floor(playhead.frame));
    };

    // Preload images
    frameSources.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) drawFrame(0);
        if (loadedCount === TOTAL_FRAMES) {
          setImagesLoaded(true);
        }
      };
      images[i] = img;
    });

    window.addEventListener("resize", updateSize);
    updateSize();

    const ctx = gsap.context(() => {
      gsap.to(playhead, {
        frame: TOTAL_FRAMES - 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=500%",
          scrub: 0.5, // Faster scrub for more responsive feel
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            drawFrame(Math.floor(playhead.frame));
          },
        },
      });
    }, container);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", updateSize);
    };
  }, [frameSources]);

  return (
    <div ref={containerRef} className="w-full">
      <div className="relative h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="block h-screen w-full" />

        {/* Overlay Content */}
        {!imagesLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-ink/15 border-t-ink/60 animate-spin" />
              <span className="text-[10px] uppercase tracking-widest text-ink-muted">
                Loading Experience
              </span>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-paper/40 via-transparent to-transparent" />

        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-paper/80 px-4 py-2 backdrop-blur-md shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink">
              Scroll to explore
            </span>
          </div>
          <div className="h-12 w-px bg-linear-to-b from-border-subtle to-transparent" />
        </div>
      </div>
    </div>
  );
}
