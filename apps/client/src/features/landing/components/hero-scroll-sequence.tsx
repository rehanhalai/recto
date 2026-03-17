"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 80;

export function HeroScrollSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobileActive, setIsMobileActive] = useState(false);
  const lastDrawnFrame = useRef<number>(-1);
  const milestoneRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  // Sync state to ref for GSAP hooks
  const isMobile = useRef(false);

  useEffect(() => {
    isMobile.current = window.innerWidth < 768;
    setIsMobileActive(isMobile.current);

    // Crucial: The hero height shift from 600vh to 100vh happens when isMobileActive changes.
    // We must refresh ScrollTrigger after this layout shift to fix markers for paper-section, etc.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, []);

  const frameSources = useMemo(() => {
    const rawFrames = Array.from(
      { length: TOTAL_FRAMES },
      (_, i) => `/frames/frame_${String(i + 1).padStart(4, "0")}.webp`,
    );

    // On mobile, we only need the first frame
    if (isMobile.current) {
      return [rawFrames[0]];
    }
    return rawFrames;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const pinElement = pinRef.current;
    const milestoneEl = milestoneRef.current;

    if (!container || !pinElement) return;

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
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;

      const maxDpr = isMobile.current ? 1.2 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
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
      if (!canvas) return;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;

      const frameIndex = normalizeFrame(frame);

      // Don't redraw if frame hasn't changed
      if (frameIndex === lastDrawnFrame.current) return;

      const image = images[frameIndex];
      if (!image || !image.complete || image.naturalWidth === 0) return;

      // Update layout only if size changed or first run
      if (layout.width === 0) updateLayout(image);

      context.clearRect(0, 0, layout.width, layout.height);

      // Draw black background beneath
      context.fillStyle = "black";
      context.fillRect(0, 0, layout.width, layout.height);

      // Performance optimization for mobile: disable high quality smoothing
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      // Calculate fade to black at the end of the sequence (progress 0.75 to 1.0)
      const progress = frame / TOTAL_FRAMES;
      let imageAlpha = 1;
      if (progress > 0.7) {
        imageAlpha = Math.max(0, 1 - (progress - 0.7) / 0.25);
      }

      context.globalAlpha = imageAlpha;

      context.drawImage(
        image,
        layout.offsetX,
        layout.offsetY,
        layout.drawWidth,
        layout.drawHeight,
      );

      // Restore alpha
      context.globalAlpha = 1.0;

      lastDrawnFrame.current = frameIndex;
    };

    const gsapContext = gsap.context(() => {
      // Fade in the hero text on load - this MUST run on mobile too
      if (heroTextRef.current) {
        gsap.to(heroTextRef.current, {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power3.out",
          delay: 0.5,
        });
      }

      // Everything below this point (Sequencing, Pinning) is desktop only
      if (isMobile.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 2,
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
          drawFrame(playhead.frame);

          // Milestone logic - optimized to prevent redundant calls
          const progress = playhead.frame / TOTAL_FRAMES;

          if (heroTextRef.current) {
            const currentOpacity = (heroTextRef.current as HTMLElement).style
              .opacity;
            if (progress >= 0.5 && currentOpacity !== "0") {
              gsap.to(heroTextRef.current, {
                opacity: 0,
                duration: 0.5,
                overwrite: "auto",
              });
            } else if (progress < 0.5 && currentOpacity === "0") {
              gsap.to(heroTextRef.current, {
                opacity: 1,
                duration: 0.5,
                overwrite: "auto",
              });
            }
          }

          if (!milestoneEl) return;

          const currentText = milestoneEl.textContent;
          let nextText = "";
          let nextOpacity = 0;
          let nextY = 20;

          if (progress > 0 && progress < 0.4) {
            nextText = "The library of your dreams";
            nextOpacity = 1;
            nextY = 0;
          } else if (progress >= 0.4 && progress < 0.7) {
            nextText = "Reimagined for the digital age";
            nextOpacity = 1;
            nextY = 0;
          } else if (progress >= 0.7) {
            nextText = "Reimagined for the digital age";
            nextOpacity = 0;
            nextY = -20;
          }

          if (
            nextText !== currentText ||
            (nextOpacity === 1 &&
              (milestoneEl as HTMLElement).style.opacity === "0")
          ) {
            milestoneEl.textContent = nextText;
            gsap.to(milestoneEl, {
              opacity: nextOpacity,
              y: nextY,
              duration: 0.5,
              overwrite: "auto",
            });
          }
        },
      });
    }, container || undefined);

    const loadImages = async () => {
      // On mobile, we only need the text fade
      if (isMobile.current) return;

      // Prioritized batch: first 15 frames
      const priorityCount = 15;
      const priorityPromises = frameSources
        .slice(0, priorityCount)
        .map((src, i) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src;
            img.decoding = "async";
            img.onload = async () => {
              try {
                await img.decode();
                images[i] = img;
                if (i === 0) drawFrame(1);
              } catch (e) {
                console.warn("Failed to decode image, falling back", e);
                images[i] = img;
              }
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
        img
          .decode()
          .then(() => {
            images[i + priorityCount] = img;
          })
          .catch(() => {
            // fallback if decode fails
            img.onload = () => {
              images[i + priorityCount] = img;
            };
          });
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
    <div
      ref={containerRef}
      className={`relative w-full ${isMobileActive ? "h-screen" : "h-[600vh]"}`}
    >
      <div
        ref={pinRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-black"
      >
        {isMobileActive ? (
          <img
            src={frameSources[0]}
            alt="Hero Background"
            className="absolute inset-0 h-screen w-full object-cover z-10"
          />
        ) : (
          <canvas
            ref={canvasRef}
            aria-label="Scroll-driven cinematic preview"
            className="relative z-10 block h-screen w-full"
          />
        )}

        {/* Hero Text */}
        <div
          ref={heroTextRef}
          className="absolute -top-[10%] -bottom-[10%] left-0 w-full md:w-3/5 flex flex-col justify-center px-8 md:px-16 lg:px-24 z-20 pointer-events-none bg-linear-to-r from-black/90 via-black/40 to-transparent opacity-0"
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

        <div className="scroll-indicator pointer-events-none absolute bottom-30 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center gap-6">
          {!isMobile.current && (
            <div
              ref={milestoneRef}
              className="opacity-0 text-center text-white font-serif italic text-xl mb-20 max-w-xs"
            />
          )}

          <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md">
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
    </div>
  );
}
