"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/fetch";
import {
  BookOpenIcon,
  StarIcon,
  UsersIcon,
  ChatCircleIcon,
  TrendUpIcon,
  ListBulletsIcon,
  CompassIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────
// MODULE-LEVEL STATIC DATA (perf: no re-allocations on render)
// ─────────────────────────────────────────────────────────

const HERO_LINES = [
  { text: "Discover Your Next", weight: "font-light" },
  { text: "Great Read.", weight: "font-bold" },
] as const;

const FEATURES = [
  {
    icon: BookOpenIcon,
    title: "Track",
    description:
      "Log every book you've read, mark current reads, and follow your progress throughout the year.",
    size: "large",
  },
  {
    icon: StarIcon,
    title: "Review",
    description:
      "Write detailed reviews, share ratings, and engage with passionate readers.",
    size: "small",
  },
  {
    icon: CompassIcon,
    title: "Discover",
    description:
      "Explore curated lists, trending books, and genre-based recommendations.",
    size: "small",
  },
  {
    icon: UsersIcon,
    title: "Connect",
    description:
      "Follow readers, join discussions, and build your literary community.",
    size: "small",
  },
] as const;

const PILLARS = [
  {
    num: "01",
    icon: ChatCircleIcon,
    title: "Social Reviews & Blogs",
    description:
      "Share detailed opinions, write in-depth posts, and engage in real conversations about books.",
  },
  {
    num: "02",
    icon: TrendUpIcon,
    title: "Smart Tracking",
    description:
      "Detailed reading stats, yearly goals, and habit insights that actually make you want to read more.",
  },
  {
    num: "03",
    icon: ListBulletsIcon,
    title: "Curated Lists",
    description:
      "Create and share reading lists. Discover trending collections curated by the community.",
  },
] as const;

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Avid Reader",
    quote:
      "Finally, a book app that doesn't feel like a spreadsheet. Clean, focused, and actually enjoyable to use.",
    initials: "SC",
  },
  {
    name: "James Wilson",
    role: "Book Critic",
    quote:
      "The community aspect is what sets Recto apart. Real conversations about real books — nothing more.",
    initials: "JW",
  },
  {
    name: "Emma Davis",
    role: "Literature Student",
    quote:
      "I've been waiting for something like Recto for years. The design alone made me want to read more.",
    initials: "ED",
  },
  {
    name: "Arjun Mehta",
    role: "Weekend Reader",
    quote:
      "I built my entire reading list for 2025 in an afternoon. It just works the way your brain does.",
    initials: "AM",
  },
  {
    name: "Léa Dubois",
    role: "Librarian",
    quote:
      "Recommending this to every patron. It's the GoodReads we deserved but never got.",
    initials: "LD",
  },
  {
    name: "Marcus Osei",
    role: "Sci-fi Enthusiast",
    quote:
      "Discovering new books just got dangerous. My to-read pile has tripled since the beta.",
    initials: "MO",
  },
] as const;

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "Will Recto be free?",
    answer:
      "Yes. Core features — tracking, reviews, lists, community — are always free. We believe access to a beautiful reading tool shouldn't cost anything.",
  },
  {
    id: "faq-2",
    question: "When is Recto launching?",
    answer:
      "We're in early access, building towards public launch. Sign up and you'll be among the first to know — and the first in.",
  },
  {
    id: "faq-3",
    question: "Can I import data from Goodreads?",
    answer:
      "Goodreads import is on our roadmap. We want switching to be painless — your reading history belongs to you.",
  },
  {
    id: "faq-4",
    question: "Will there be a mobile app?",
    answer:
      "Yes. Mobile is a priority. The web experience is fully responsive today, with a native app planned post-launch.",
  },
] as const;

// ─────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Refs for GSAP targets
  const heroRef = useRef<HTMLElement>(null);
  const line0Ref = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const heroDividerRef = useRef<HTMLDivElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const aboutRightRef = useRef<HTMLDivElement>(null);
  const ctaBannerRef = useRef<HTMLElement>(null);

  // Stable auth check — useCallback to prevent re-creation
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

  // Memoize doubled testimonials for the marquee (stable reference)
  const doubledTestimonials = useMemo(
    () => [...TESTIMONIALS, ...TESTIMONIALS],
    [],
  );

  // GSAP Animations — only after auth check resolves
  useEffect(() => {
    if (checkingAuth) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // ── HERO: Two-line cinematic reveal ───────────────────
      gsap.from([line0Ref.current, line1Ref.current], {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.15,
      });

      gsap.from(heroDividerRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.3,
        ease: "power4.out",
        delay: 0.25,
      });

      gsap.from(heroSubRef.current, {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.5,
      });

      gsap.from(heroCtaRef.current, {
        y: 18,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.72,
      });

      // ── MANIFESTO: fade-in on scroll ─────────────────────
      if (manifestoRef.current) {
        gsap.from(manifestoRef.current.querySelector(".manifesto-text"), {
          scrollTrigger: {
            trigger: manifestoRef.current,
            start: "top 85%",
          },
          opacity: 0,
          y: 20,
          duration: 1,
          ease: "power3.out",
        });
      }

      // ── FEATURES: staggered reveal ────────────────────────
      if (featuresRef.current) {
        gsap.from(featuresRef.current.querySelector(".features-header"), {
          scrollTrigger: { trigger: featuresRef.current, start: "top 85%" },
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        });

        gsap.from(featuresRef.current.querySelectorAll(".feature-card"), {
          scrollTrigger: { trigger: featuresRef.current, start: "top 80%" },
          y: 32,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
        });
      }

      // ── ABOUT: slide from sides + subtle parallax ─────────
      if (aboutRef.current) {
        gsap.from(aboutRef.current.querySelector(".about-left"), {
          scrollTrigger: { trigger: aboutRef.current, start: "top 80%" },
          x: -36,
          opacity: 0,
          duration: 0.95,
          ease: "power3.out",
        });

        if (aboutRightRef.current) {
          gsap.from(aboutRightRef.current, {
            scrollTrigger: { trigger: aboutRef.current, start: "top 80%" },
            x: 36,
            opacity: 0,
            duration: 0.95,
            ease: "power3.out",
          });

          // Parallax scrub
          gsap.to(aboutRightRef.current, {
            scrollTrigger: {
              trigger: aboutRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
            y: -50,
            ease: "none",
          });
        }
      }

      // ── CTA BANNER ────────────────────────────────────────
      if (ctaBannerRef.current) {
        gsap.from(ctaBannerRef.current.querySelector(".cta-content"), {
          scrollTrigger: {
            trigger: ctaBannerRef.current,
            start: "top 80%",
          },
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power4.out",
        });
      }
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
    <div className="min-h-screen bg-paper text-ink overflow-x-hidden">
      {/* ══════════════════════════════════════════════
          NAVIGATION
      ══════════════════════════════════════════════ */}
      <Navbar />

      {/* ══════════════════════════════════════════════
          HERO — Full Viewport, Cinematic
      ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] flex flex-col justify-center px-6 sm:px-10 lg:px-20 pt-24 pb-20 overflow-hidden"
      >
        {/* Background watermark — decorative, aria-hidden */}
        <span
          aria-hidden="true"
          className="font-cormorant absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 text-[32vw] font-italic text-ink/[0.022] dark:text-ink/[0.04] select-none pointer-events-none leading-none"
        >
          R
        </span>

        {/* Eyebrow badge — gold dot + Cormorant italic label */}
        <div className="flex items-center gap-2.5 mb-10">
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"
          />
          <span className="font-cormorant text-sm text-gold tracking-[0.15em]">
            Early Access — Coming Soon
          </span>
        </div>

        {/* Headline — two lines, weight contrast */}
        <div className="mb-8 overflow-hidden">
          <h1 className="text-[clamp(3.2rem,8.5vw,7.8rem)] font-serif tracking-tighter leading-[0.9] max-w-5xl">
            <span
              ref={line0Ref}
              className="block font-light text-ink/80 dark:text-ink/80"
            >
              {HERO_LINES[0].text}
            </span>
            <span
              ref={line1Ref}
              className="block font-bold text-ink dark:text-ink"
            >
              {HERO_LINES[1].text}
            </span>
          </h1>
        </div>

        {/* Animated divider */}
        <div
          ref={heroDividerRef}
          aria-hidden="true"
          className="w-20 h-px bg-gold/60 mb-8"
        />

        {/* Subheadline — DM Sans, light, restrained */}
        <p
          ref={heroSubRef}
          className="text-base sm:text-lg text-ink-muted max-w-md leading-loose mb-12 font-light tracking-wide"
        >
          A social reading platform for people who take books seriously. Track.
          Discover. Connect.
        </p>

        {/* CTA Row */}
        <div
          ref={heroCtaRef}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <Link href="/signup">
            <Button className="bg-ink text-paper dark:bg-ink dark:text-paper hover:bg-accent-dark dark:hover:bg-accent-dark font-medium text-sm px-7 py-5 rounded-lg transition-all duration-200 cursor-pointer shadow-sm">
              Request Early Access
              <ArrowRightIcon aria-hidden="true" className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link
            href="#about"
            className="text-sm text-ink-muted hover:text-ink dark:hover:text-ink font-medium transition-colors duration-200 cursor-pointer flex items-center gap-1.5 group"
          >
            Learn what we&apos;re building
            <span className="group-hover:translate-x-0.5 transition-transform duration-200">
              →
            </span>
          </Link>
        </div>

        {/* Scroll cue */}
        <div
          aria-label="Scroll down"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
        >
          <span className="text-[9px] uppercase tracking-[0.22em] font-dm-sans">
            Scroll
          </span>
          <div
            aria-hidden="true"
            className="w-px h-8 bg-ink dark:bg-ink animate-[pulse_2.5s_ease-in-out_infinite]"
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MANIFESTO STRIP — Full-width editorial quote
      ══════════════════════════════════════════════ */}
      <section
        ref={manifestoRef}
        className="border-y border-border-subtle dark:border-border-subtle py-14 px-6 sm:px-10 overflow-hidden"
      >
        <p className="manifesto-text text-center max-w-5xl mx-auto text-xl sm:text-2xl md:text-3xl font-cormorant text-ink/75 dark:text-ink/70 leading-snug">
          &ldquo;For the readers who finish books in one sitting. Who mark pages
          with receipts. Who judge a room by its shelves.&rdquo;
        </p>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES — Asymmetric Bento Grid
      ══════════════════════════════════════════════ */}
      <section id="features" ref={featuresRef} className="py-28 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="features-header mb-14">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold mb-4">
              What Recto Offers
            </p>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold tracking-tighter text-ink max-w-lg leading-tight">
              Everything a serious reader needs.
            </h2>
          </div>

          {/* Bento grid — asymmetric */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large "Track" card — spans 2 cols on lg */}
            <div className="feature-card lg:col-span-2 group p-7 rounded-2xl border border-border-subtle dark:border-border-subtle bg-card dark:bg-card hover:border-ink/20 dark:hover:border-ink/20 transition-all duration-300 cursor-default">
              <div className="flex items-start justify-between mb-8">
                <div className="w-8 h-8 flex items-center justify-center">
                  <BookOpenIcon
                    aria-hidden="true"
                    className="w-5 h-5 text-ink-muted"
                    weight="light"
                  />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted/50">
                  01
                </span>
              </div>
              <h3 className="text-2xl font-serif font-semibold text-ink mb-3 tracking-tight">
                Track
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-8 max-w-xs">
                Log every book you&apos;ve read, mark current reads, and follow
                your reading progress throughout the year.
              </p>
              {/* Inline progress bar mockup */}
              <div className="space-y-2.5">
                {[
                  {
                    title: "The Remains of the Day",
                    pct: 68,
                    color: "bg-blue-700",
                  },
                  { title: "East of Eden", pct: 41, color: "bg-amber-700" },
                  { title: "Middlemarch", pct: 19, color: "bg-emerald-800" },
                ].map((b) => (
                  <div key={b.title} className="flex items-center gap-3">
                    <div
                      className={`w-4 h-6 rounded-sm flex-shrink-0 ${b.color}`}
                      aria-hidden="true"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] text-ink-muted truncate pr-2">
                          {b.title}
                        </span>
                        <span className="text-[11px] text-ink-muted flex-shrink-0">
                          {b.pct}%
                        </span>
                      </div>
                      <div className="h-0.5 w-full bg-border-subtle dark:bg-border-subtle rounded-full overflow-hidden">
                        <div
                          className="h-full bg-ink/30 dark:bg-ink/30 rounded-full"
                          style={{ width: `${b.pct}%` }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Three small cards */}
            {FEATURES.slice(1).map((f, i) => (
              <div
                key={f.title}
                className="feature-card group p-7 rounded-2xl border border-border-subtle dark:border-border-subtle bg-card dark:bg-card hover:border-ink/20 dark:hover:border-ink/20 transition-all duration-300 cursor-default"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <f.icon
                      aria-hidden="true"
                      className="w-5 h-5 text-ink-muted"
                      weight="light"
                    />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted/50">
                    0{i + 2}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-semibold text-ink mb-2 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ABOUT — Dark Editorial Section
      ══════════════════════════════════════════════ */}
      <section
        id="about"
        ref={aboutRef}
        className="py-28 px-6 sm:px-10 bg-ink dark:bg-card text-paper dark:text-ink overflow-hidden"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div className="about-left">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-paper/40 dark:text-ink-muted mb-6">
              Our Mission
            </p>

            {/* Pull quote in Cormorant */}
            <blockquote className="font-cormorant text-2xl sm:text-3xl text-paper/80 dark:text-ink/80 leading-snug mb-8 border-l-2 border-gold/40 pl-5">
              &ldquo;Books are uniquely portable magic.&rdquo;
              <cite className="block text-sm font-sans font-light text-paper/40 dark:text-ink-muted not-italic mt-2">
                — Stephen King
              </cite>
            </blockquote>

            <p className="text-paper/65 dark:text-ink-muted text-sm leading-loose mb-10">
              Recto is a social platform built for book enthusiasts. Whether
              you&apos;re a casual reader or a devoted bookworm, Recto helps you
              own your reading life — without the clutter.
            </p>

            {/* Numbered pillars */}
            <div className="space-y-7">
              {PILLARS.map((pillar) => (
                <div key={pillar.num} className="flex items-start gap-4">
                  <span className="font-cormorant text-lg text-gold/70 mt-0.5 w-8 flex-shrink-0 leading-none">
                    {pillar.num}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-paper dark:text-ink mb-1 font-sans">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-paper/55 dark:text-ink-muted leading-relaxed font-sans">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — elevated book card (parallax target) */}
          <div
            ref={aboutRightRef}
            className="flex justify-center md:justify-end"
          >
            <div className="w-full max-w-sm">
              <div className="bg-paper/[0.06] dark:bg-ink/[0.04] rounded-2xl border border-paper/12 dark:border-border-subtle p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-paper/35 dark:text-ink-muted">
                    Currently Reading
                  </p>
                  <p className="font-cormorant text-xs text-gold/60 italic">
                    3 active
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      color: "bg-blue-700",
                      title: "The Remains of the Day",
                      author: "Kazuo Ishiguro",
                      progress: 68,
                    },
                    {
                      color: "bg-amber-700",
                      title: "East of Eden",
                      author: "John Steinbeck",
                      progress: 41,
                    },
                    {
                      color: "bg-emerald-800",
                      title: "Middlemarch",
                      author: "George Eliot",
                      progress: 19,
                    },
                  ].map((book) => (
                    <div
                      key={book.title}
                      className="flex items-center gap-3 p-3 rounded-xl bg-paper/[0.05] dark:bg-ink/[0.05] border border-paper/8 dark:border-border-subtle"
                    >
                      <div
                        className={`w-8 h-12 rounded flex-shrink-0 shadow-md ${book.color}`}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-paper dark:text-ink truncate">
                          {book.title}
                        </p>
                        <p className="text-[10px] text-paper/45 dark:text-ink-muted mt-0.5">
                          {book.author}
                        </p>
                        <div className="mt-2 h-0.5 w-full bg-paper/10 dark:bg-border-subtle rounded-full overflow-hidden">
                          <div
                            className="h-full bg-paper/45 dark:bg-ink-muted rounded-full"
                            style={{ width: `${book.progress}%` }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-paper/35 dark:text-ink-muted flex-shrink-0">
                        {book.progress}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Mini stats */}
                <div className="mt-5 pt-4 border-t border-paper/10 dark:border-border-subtle grid grid-cols-3 gap-2 text-center">
                  {[
                    { v: "24", l: "Books" },
                    { v: "4.2★", l: "Avg" },
                    { v: "18d", l: "Streak" },
                  ].map((s) => (
                    <div key={s.l}>
                      <p className="text-sm font-bold text-paper dark:text-ink font-serif">
                        {s.v}
                      </p>
                      <p className="text-[9px] text-paper/35 dark:text-ink-muted uppercase tracking-wider">
                        {s.l}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS — CSS Marquee (zero JS)
      ══════════════════════════════════════════════ */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 mb-12">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold mb-4">
            Early Readers
          </p>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold tracking-tighter text-ink">
            People are waiting.
          </h2>
        </div>

        {/* Marquee track — aria: the section heading gives context */}
        <div
          className="flex"
          aria-label="Testimonials from early readers"
          role="region"
        >
          <div className="flex gap-4 animate-marquee will-change-transform">
            {doubledTestimonials.map((t, i) => (
              <article
                key={`${t.initials}-${i}`}
                className="flex-shrink-0 w-72 sm:w-80 p-6 rounded-2xl border border-border-subtle dark:border-border-subtle bg-card dark:bg-card mx-2"
              >
                {/* Gold quotemark */}
                <span
                  aria-hidden="true"
                  className="font-cormorant text-3xl text-gold/50 leading-none block mb-3"
                >
                  &ldquo;
                </span>
                <blockquote className="text-sm text-ink leading-relaxed mb-5">
                  {t.quote}
                </blockquote>
                <footer className="flex items-center gap-3 pt-4 border-t border-border-subtle dark:border-border-subtle">
                  <div className="w-8 h-8 rounded-full bg-ink dark:bg-ink flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-semibold text-paper dark:text-paper">
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink">{t.name}</p>
                    <p className="text-[10px] text-ink-muted">{t.role}</p>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════ */}
      <section
        id="faq"
        className="py-24 px-6 sm:px-10 border-t border-border-subtle dark:border-border-subtle"
      >
        <div className="max-w-3xl mx-auto">
          <div className="mb-14">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold mb-4">
              Got Questions?
            </p>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold tracking-tighter text-ink">
              We&apos;ve got answers.
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border border-border-subtle dark:border-border-subtle rounded-xl overflow-hidden bg-card dark:bg-card"
              >
                <AccordionTrigger className="px-6 py-5 hover:no-underline text-ink font-medium font-sans text-left text-sm cursor-pointer">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-ink-muted text-sm leading-loose font-sans">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FINAL CTA — Cinematic Dark Banner
      ══════════════════════════════════════════════ */}
      <section
        ref={ctaBannerRef}
        className="py-32 px-6 sm:px-10 bg-ink dark:bg-card overflow-hidden"
      >
        <div className="cta-content max-w-3xl mx-auto text-center">
          {/* Gold rule */}
          <div aria-hidden="true" className="w-12 h-px bg-gold mx-auto mb-10" />

          <p className="font-cormorant text-sm tracking-[0.22em] text-paper/40 dark:text-ink-muted mb-6">
            Get Early Access
          </p>

          <h2 className="text-4xl sm:text-6xl font-serif font-bold tracking-tighter text-paper dark:text-ink mb-4 leading-tight">
            Your reading life,{" "}
            <em className="font-normal not-italic font-cormorant text-paper/70 dark:text-ink/70">
              beautifully kept.
            </em>
          </h2>

          <p className="text-paper/50 dark:text-ink-muted text-sm leading-relaxed mb-12 max-w-md mx-auto">
            Join the waitlist. Be the first to experience Recto when we open
            doors — no spam, just the good stuff.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button className="bg-paper text-ink dark:bg-ink dark:text-paper hover:bg-paper/90 dark:hover:bg-ink/90 font-medium text-sm px-8 py-5 rounded-lg transition-all duration-200 cursor-pointer">
                Join the Waitlist
                <ArrowRightIcon aria-hidden="true" className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/home">
              <Button
                variant="ghost"
                className="text-paper/50 dark:text-ink-muted hover:text-paper dark:hover:text-ink text-sm px-5 py-5 cursor-pointer"
              >
                Preview the app →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}
