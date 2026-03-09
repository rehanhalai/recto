---
description: GSAP Animation Generation Workflow
---

# Skill: GSAP Animation Generation (`gsap-animation-gen`)

This is the strict execution manual for generating performance-critical, layout-thrashing-free animations in the `recto-client` Next.js application. You **MUST** execute this exact checklist sequentially every time you implement complex UI choreography.

## 1. Tooling Mandate: GSAP Exclusivity

- [ ] You are strictly mandated to use **GSAP** and the `@gsap/react` package.
- [ ] Framer Motion, React Spring, or custom `useEffect` CSS loops are **absolutely forbidden**.
- [ ] Use the `useGSAP` hook for all animation instances within a React component.

## 2. SSR & Hydration Safety Rules

GSAP animations must never interfere with Next.js Server-Side Rendering (SSR) or trigger React hydration mismatches.

- [ ] Ensure the component using GSAP has the `"use client"` directive at the top.
- [ ] **Forbidden:** Do not access `window`, `document`, `navigator`, or attempt to measure DOM nodes directly in the component body.
- [ ] All GSAP logic, DOM measurements, and ScrollTrigger initializations must be securely executed **only inside** the `useGSAP` hook, which safely defers execution to the client lifecycle.

## 3. The Pixel Pipeline Law

You must physically restrain from animating properties that trigger browser reflows (layout thrashing).

- [ ] Ensure GSAP timelines **ONLY** animate hardware-accelerated properties: `transform` (`x`, `y`, `scale`, `rotation`, etc.) and `opacity`.
- [ ] **Forbidden:** You are strictly prohibited from animating `width`, `height`, `margin`, `padding`, `top`, `left`, `right`, or `bottom`.
- [ ] If an element needs to "grow", animate its `scale`. If it needs to "move", animate `x` or `y`.

## 4. Ref Management and Targeting

Do not query the global DOM stringently. Animation targets must be React-aware.

- [ ] Enforce the use of `useRef` to target specific elements (`<div ref={boxRef}>`).
- [ ] Pass the appropriate `ref` scope to `useGSAP` (`useGSAP(() => {...}, { scope: containerRef })`).
- [ ] **Forbidden:** Do not use generic string selectors (e.g., `gsap.to('.card', {...})`) unless they are strictly constrained within the specific `useGSAP` container scope. Avoid animating global elements outside your component tree.

## 5. Cleanup and Memory Leak Prevention

Animations must die gracefully when the component unmounts.

- [ ] By using `@gsap/react`'s `useGSAP` hook, standard timelines and tweens created inside the hook will be automatically reverted on unmount.
- [ ] **ScrollTrigger Verification:** Double-check that all `ScrollTrigger` instances are explicitly attached to timelines or tweens generated inside the `useGSAP` hook so they are reliably killed on unmount. If creating standalone ScrollTriggers, ensure they are tracked and killed manually via the cleanup return function if necessary, though `useGSAP` handles most cases.
