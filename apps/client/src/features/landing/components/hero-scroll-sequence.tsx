"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 96;

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

    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.max(1, Math.round(rect.width * dpr));
      const nextHeight = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    };

    const drawFrame = (frame: number) => {
      const rect = setCanvasSize();
      const width = rect.width;
      const height = rect.height;
      const image = images[normalizeFrame(frame)];

      context.clearRect(0, 0, width, height);

      if (!image || !image.complete || image.naturalWidth === 0) return;

      const scale = Math.max(
        width / image.naturalWidth,
        height / image.naturalHeight,
      );
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    };

    const gsapContext = gsap.context(() => {
      gsap.to(playhead, {
        frame: frameSources.length,
        snap: "frame",
        ease: "none",
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
        onUpdate: () => {
          drawFrame(playhead.frame);
        },
      });
    }, container);

    const handleResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        drawFrame(playhead.frame);
        ScrollTrigger.refresh();
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });

    frameSources.forEach((source, index) => {
      const image = new Image();
      image.src = source;
      image.decoding = "async";
      image.onload = () => {
        if (index === 0) {
          drawFrame(1);
        }

        if (index === normalizeFrame(playhead.frame)) {
          drawFrame(playhead.frame);
        }
      };

      images[index] = image;
    });

    return () => {
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", handleResize);
      gsapContext.revert();
    };
  }, [frameSources]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-label="Scroll-driven cinematic preview"
          className="block h-screen w-full"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-paper/35 via-transparent to-paper/10"
        />

        <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-border-subtle bg-paper/75 px-3 py-1.5">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-gold"
          />
          <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">
            Scroll to play
          </span>
        </div>
      </div>
    </div>
  );
}
