---
description: Component Generation Workflow
---

# Skill: Component Generation (`component-gen`)

This is the execution manual for creating any new React component in the `recto-client` Next.js application. You **MUST** execute this exact checklist sequentially every time you scaffold a new component.

## 1. Decision Matrix: RSC vs. Client Component

Before writing any code, determine the component's rendering environment. Default to React Server Component (RSC).

- [ ] **Does it require `useState`, `useReducer`, or `useEffect`?** -> Use `"use client"`
- [ ] **Does it require React Context or TanStack Query hooks?** -> Use `"use client"`
- [ ] **Does it use browser APIs (`window`, `document`, `navigator`)?** -> Use `"use client"`
- [ ] **Does it render GSAP animations or use `@gsap/react`?** -> Use `"use client"`
- [ ] **Does it handle DOM events (`onClick`, `onChange`, etc.)?** -> Use `"use client"`
- [ ] **If NONE of the above apply:** The component **MUST** be a Server Component. Omit the `"use client"` directive.

## 2. Directory Routing: Feature-Sliced Design (FSD) vs. UI

Determine the exact file path based on the component's responsibility.

- [ ] **Is it a purely visual, highly reusable element?** (e.g., Button, Input, Modal shell)
      -> Scaffold in `src/components/ui/[component-name].tsx`.
      -> It must contain **ZERO** business logic, data fetching, or Zod schema awareness.
- [ ] **Does it contain domain-specific logic, complex state, or API/DB interaction?** (e.g., BookFeed, UserProfileCard, CheckoutForm)
      -> Scaffold in `src/features/[domain]/components/[component-name].tsx`.
      -> Create the feature directory if it does not exist.

## 3. Strict Prop Typing

You must enforce strong boundaries for component inputs.

- [ ] Define a TypeScript `interface` or `type` for the component props. Example: `[ComponentName]Props`.
- [ ] The `any` or `unknown` types are **strictly forbidden**.
- [ ] Explicitly type children as `React.ReactNode` where applicable.
- [ ] For Client Components that accept functions as props, type them strictly (e.g., `onSelect: (id: string) => void`).

## 4. Styling & Layout Discipline

Enforce the premium design system without exceptions.

- [ ] Check `tailwind.config.ts` (or the design token file) for available classes.
- [ ] **Zero Hardcoding:** Are there any arbitrary values like `text-[#ff0000]` or `w-[314px]`? Remove them. Use theme tokens exclusively.
- [ ] **Grid Math:** Are all margins, paddings, and sizing values multiples of 4 or 8 (e.g., `p-4`, `gap-2`, `m-8`)?
- [ ] **1D vs 2D:** Use `grid` for macroscopic page structure. Use `flex` for inner alignment of items. **No absolute positioning** unless creating overlays (tooltips, modals).
- [ ] **Mobile-First:** Ensure the base classes apply to the smallest screen. Use `sm:`, `md:`, `lg:` only for scaling up.

## 5. Non-Negotiable Accessibility (A11y) Verification

Before finalizing the component, it must pass this validation list.

- [ ] **Semantic HTML:** Does the root element accurately describe the content? (e.g., `<article>`, `<nav>`, `<section>`, `<aside>`). Stop using generic `<div>` tags as wrappers.
- [ ] **Interactive Elements:** Are you using `<button>` for actions and `<a>` (or `<Link>`) for navigation? Never use `<div onClick={...}>`.
- [ ] **Keyboard Navigability:** Do all interactive elements have a clear, distinct `:focus-visible` state defined?
- [ ] **Screen Reader Context:** Are `aria-label`, `aria-expanded`, or `aria-hidden` attributes applied wherever visual context is not inherently available in the text?
