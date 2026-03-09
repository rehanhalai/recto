# Recto Client Agent Rules (AGENT.md)

Welcome to the `recto-client` Agent Configuration. This file defines the core architectural, design, performance, and operational constraints that the AI must follow when operating in the frontend Next.js App Router codebase.

The overriding goal is to build a highly optimized, accessible, visually spectacular Next.js application that natively leverages Server Components, Suspense streaming, CSS Grid math, and hardware-accelerated animations (GSAP) combined with strict Feature-Sliced Design.

## 1. App Router & Server Components Default

- **RSC Default:** React Server Components (RSC) must be used by default for all layout structure and initial data loads.
- **Client Boundaries:** Use `"use client"` directives ONLY at the lowest possible leaf node in the component tree. It is strictly limited to components requiring browser APIs, interactivity (hooks), animations (GSAP), or TanStack Query boundaries.

## 2. Server-First Data Fetching & Strict TanStack Query Limits

- **Initial Page Loads:** React Server Components (RSCs) MUST handle 100% of initial data fetching directly from the NestJS backend. Do not hydrate React Query from the server unless absolutely, unequivocally necessary.
- **TanStack Query Restrictions:** TanStack Query is strictly reserved for complex, dynamic client-side interactions after the initial load (e.g., infinite scrolling feeds, polling, background synchronization, or multi-step iterative mutations).
- **Direct Fetching:** Use native `fetch` with Next.js specific caching/revalidation tags in server components to interact with the API.

## 3. Suspense, Streaming, & Error Boundaries

- **No Top-Level Blockers:** Never fetch data at the top-level page component in a way that blocks the entire UI render.
- **Isolation:** Enforce the isolation of data-fetching into distinct, deeply nested asynchronous Server Components.
- **Streaming Fallbacks:** Wrap these isolated data components in `<Suspense>` boundaries with localized, visually accurate skeleton fallbacks to fully leverage Next.js streaming architecture.
- **Mandatory Error Boundaries:** Alongside `<Suspense>` boundaries, you must implement `error.tsx` (and `global-error.tsx`) to catch promise rejections and isolate failures to specific UI segments. A failed fetch must never crash the entire page layout.

## 4. UI Component Isolation vs. Feature-Sliced Design (FSD)

- **Dumb Components (`src/components/ui`):** These must contain zero business logic and zero awareness of validation schemas (Zod). They are pure presentation layers.
- **Feature-Sliced Design:** All domain logic, hooks, complex state, and specific API calls must be organized by feature, not by generic file type.
- **Feature Encapsulation:** Group logic into directories like `src/features/books`, `src/features/users`, or `src/features/feed`. Inside each feature, encapsulate its own `components/`, `api/`, `hooks/`, and `utils/`.

## 5. Forms, Server Actions, & Zod Validation

- **Strict Validation Boundary:** Zod validation is strictly enforced at the API boundary (Client to Server Action transition) and inside custom form hooks (`react-hook-form`).
- **Server Actions:** Use Server Actions (`"use server"`) primarily for secure mutations, triggering `revalidatePath` or `revalidateTag` upon success.

## 6. Design Token Supremacy (Zero Hardcoding)

- **Tailwind Supremacy:** Strictly adhere to the established design system and Tailwind configuration.
- **No Magic Numbers:** Never hardcode arbitrary colors, spacing (e.g., `gap-[17px]`), typography, or z-index values. Use only predefined theme tokens (e.g., `text-brand-primary`, `spacing-layout`).
- **Config Addition Permission:** If a required token doesn't exist, request permission to add it to the global `tailwind.config.ts`.

## 7. The Pixel Pipeline, Animation Discipline, & Hydration Traps

- **Prevent Layout Thrashing:** Optimize all animations. For micro-interactions (hovers, basic transitions), strictly use CSS `transition` targeting ONLY hardware-accelerated properties (`transform`, `opacity`).
- **Premium Choreography:** For complex, timeline-based UI choreographies, exclusively use GSAP.
- **Hydration Traps & SSR Safety:** GSAP animations in Next.js must be completely hydration-safe. You are strictly forbidden from writing animation logic that assumes browser APIs (like `window` or `document`) are available during the server render.
- **GSAP + React Safety:** Strictly rely entirely on `@gsap/react`'s `useGSAP` hook and handle SSR discrepancies cleanly to prevent React hydration mismatch errors. Use `useRef` to prevent re-render loops.

## 8. Non-Negotiable Accessibility (A11y)

- **Semantic HTML:** Accessibility is mandatory. Use semantic HTML5 elements exclusively (`<button>`, `<nav>`, `<article>`, `<dialog>`).
- **Keyboard Navigation:** Every interactive element must be completely keyboard navigable with a distinct, custom `:focus-visible` state.
- **Screen Readers:** Include explicit `aria-labels` and `aria-expanded` attributes where visual context is hidden. Do not use `<div>` tags with `onClick` handlers for interactive elements.

## 9. Layout Math and Grid Logic

- **Spatial Grid:** Adhere to a rigid 4pt/8pt spatial grid for all margins, paddings, and dimensions.
- **Macroscopic Grid:** Use CSS Grid explicitly for macroscopic 2D page structures (like the main application shell or a dashboard layout).
- **Microscopic Flex:** Use Flexbox exclusively for one-dimensional component alignment (like navigation bars or lists of tags).
- **Position Alignment:** Do not use absolute positioning unless completely unavoidable (e.g., tooltips, popovers, modals).

## 10. Strict Mobile-First Fluidity

- **Scale-Up:** Execute a strict mobile-first design pattern via Tailwind CSS. Build the base layout for the smallest screen size first without breakpoint modifiers.
- **Modifiers:** Only use breakpoint prefixes (`sm:`, `md:`, `lg:`) to scale the design up.
- **No Conditional Renders:** Never use conditional React rendering (e.g., `if (isMobile)`) for responsive layouts; rely entirely on CSS media queries.

## 11. Core Web Vitals & Media Performance

- **Layout Shift Prevention:** Mandate `next/image` with explicit sizing and placeholders to prevent Cumulative Layout Shift (CLS).
- **Dynamic Loading:** Require dynamic imports (`next/dynamic`) for heavy, non-critical client-side libraries.
