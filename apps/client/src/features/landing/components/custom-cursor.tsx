"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "none",
      });
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.25,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", moveCursor);

    // Hover effect on interactive elements
    const handleMouseEnter = () => {
      gsap.to(ring, {
        scale: 1.5,
        borderColor: "rgba(0,0,0,0.6)",
        duration: 0.3,
      });
    };
    const handleMouseLeave = () => {
      gsap.to(ring, {
        scale: 1,
        borderColor: "rgba(0,0,0,0.2)",
        duration: 0.3,
      });
    };

    const interactiveSelectors = 'a, button, [role="button"], canvas';
    const elements = document.querySelectorAll(interactiveSelectors);
    elements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 w-1 h-1 bg-ink rounded-full z-50 -translate-x-1/2 -translate-y-1/2"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 w-8 h-8 border border-black/20 rounded-full z-40 -translate-x-1/2 -translate-y-1/2"
      />
    </>
  );
}
