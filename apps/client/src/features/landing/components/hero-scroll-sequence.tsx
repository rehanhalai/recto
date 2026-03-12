"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 80;

export function HeroScrollSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const pinElement = pinRef.current;

    if (!canvas || !container || !pinElement) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const images: HTMLImageElement[] = [];
    const playhead = { frame: 1 };
    let resizeRaf = 0;

    const normalizeFrame = (frame: number) =>
      Math.min(frameSources.length - 1, Math.max(0, Math.round(frame) - 1));

    // Pre-calculated layout values
    let layout = {
      width: 0,
      height: 0,
      drawWidth: 0,
      drawHeight: 0,
      offsetX: 0,
      offsetY: 0,
      dpr: 1,
    };

    const updateLayout = (image: HTMLImageElement) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.max(1, Math.round(rect.width * dpr));
      const nextHeight = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }

      const screenWidth = rect.width;
      const screenHeight = rect.height;

      const scale = Math.max(
        screenWidth / image.naturalWidth,
        screenHeight / image.naturalHeight,
      );

      layout = {
        width: screenWidth,
        height: screenHeight,
        drawWidth: image.naturalWidth * scale,
        drawHeight: image.naturalHeight * scale,
        offsetX: (screenWidth - image.naturalWidth * scale) / 2,
        offsetY: (screenHeight - image.naturalHeight * scale) / 2,
        dpr,
      };

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = (frame: number) => {
      const image = images[normalizeFrame(frame)];
      if (!image || !image.complete || image.naturalWidth === 0) return;

      // Update layout only if size changed or first run
      if (layout.width === 0) updateLayout(image);

      context.clearRect(0, 0, layout.width, layout.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        image,
        layout.offsetX,
        layout.offsetY,
        layout.drawWidth,
        layout.drawHeight,
      );
    };

    const gsapContext = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${window.innerHeight * 5}`,
          scrub: 2,
          pin: pinElement,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Sequence animation
      tl.to(playhead, {
        frame: frameSources.length,
        snap: "frame",
        ease: "none",
        duration: 4, // 80% of the timeline
        onUpdate: () => {
          requestAnimationFrame(() => drawFrame(playhead.frame));

          // Milestone logic
          const progress = playhead.frame / TOTAL_FRAMES;
          const milestoneEl = document.querySelector(".milestone-text");
          if (milestoneEl) {
            if (progress > 0 && progress < 0.4) {
              gsap.to(milestoneEl, { opacity: 1, duration: 0.5 });
              milestoneEl.textContent = "The library of your dreams";
            } else if (progress >= 0.4 && progress < 0.7) {
              milestoneEl.textContent = "Reimagined for the digital age";
            } else if (progress >= 0.7) {
              gsap.to(milestoneEl, { opacity: 0, y: -20, duration: 0.5 });
            } else {
              gsap.to(milestoneEl, { opacity: 0, y: 20, duration: 0.5 });
            }
          }
        },
      });
    }, container);

    const loadImages = async () => {
      // Prioritized batch: first 15 frames
      const priorityCount = 15;
      const priorityPromises = frameSources
        .slice(0, priorityCount)
        .map((src, i) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src;
            img.decoding = "async";
            img.onload = () => {
              images[i] = img;
              if (i === 0) drawFrame(1);
              resolve();
            };
          });
        });

      await Promise.all(priorityPromises);

      // Background batch: rest of the frames
      frameSources.slice(priorityCount).forEach((src, i) => {
        const img = new Image();
        img.src = src;
        img.decoding = "async";
        img.onload = () => {
          images[i + priorityCount] = img;
        };
      });
    };

    const handleResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        // Reset layout to force recalculation on next draw
        layout.width = 0;
        drawFrame(playhead.frame);
        ScrollTrigger.refresh();
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });

    loadImages();

    return () => {
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", handleResize);
      gsapContext.revert();
    };
  }, [frameSources]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        ref={pinRef}
        className="relative h-screen w-full overflow-hidden bg-paper"
      >
        <canvas
          ref={canvasRef}
          aria-label="Scroll-driven cinematic preview"
          className="relative z-10 block h-screen w-full transition-transform duration-500"
        />
        <div className="scroll-indicator pointer-events-none absolute bottom-30 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center gap-6">
          <div className="milestone-text opacity-0 translate-y-20 text-center text-white font-serif italic text-xl mb-20 transition-all duration-700 max-w-xs" />

          <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-paper/75 px-4 py-2 backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse"
            />
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              Scroll to explore
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
