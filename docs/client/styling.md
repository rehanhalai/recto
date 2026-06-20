# Styling and UI Architecture Refactor

## What was before
* The client app (`apps/client`) maintained its own local copy of Shadcn UI components in `src/components/ui`.
* The client app had its own heavy `globals.css` file filled with hundreds of lines of custom color palettes (Tea Green, Beige, Cornsilk, etc.) and custom semantic color mappings (`--paper`, `--ink`).
* `apps/client/src/app/layout.tsx` was loading 6 different Google Fonts simultaneously (DM Sans, Inter, Raleway, Geist Mono, Playfair Display, Cormorant Garamond).
* This created a "split personality" where basic app pages used the custom "Literary Dusk" theme, but Shadcn components looked completely different because they were disconnected from the global styles.

## Issues / Pain Points
* **Performance Bottleneck:** Downloading 6 web fonts on initial load severely penalized the Time to First Byte (TTFB) and overall rendering speed.
* **Maintenance Nightmare:** Having styles split between a shared package and a local app meant any theme change required updates in multiple, disconnected places.
* **Visual Inconsistency:** The stark contrast between the warm custom colors and the default Shadcn component colors created a disjointed, unprofessional user experience.
* **CSS Bloat:** Hundreds of unused custom color variables were cluttering the global stylesheet without being used.

## What we did
1. **Centralized UI Package:** Moved all local Shadcn components out of `apps/client` and into a shared monorepo package: `packages/ui`.
2. **Path Aliasing & Forwarding:** Configured the client app to resolve `ui` imports directly from the shared `@recto/ui` package. Simple forwarding files were generated in `apps/client/src/components/ui` so existing imports didn't break.
3. **CSS Nuke:** Deleted all custom color palettes and variables from `apps/client/src/app/globals.css`. Replaced it with a single import statement to load the shared styles: `@import "@recto/ui/globals.css";`.
4. **Font Optimization:** Removed 5 unused Google Fonts from `layout.tsx`, leaving only `Inter` (the standard font for the chosen Shadcn preset).

## Why we did it
* To enforce a Single Source of Truth for the design system. Having styles split between the monorepo UI package and the client app led to unmaintainable code and visual inconsistencies.
* The Shadcn CLI setup needed to be mapped so that we could run commands in the Next.js app but output the files directly into the shared workspace.

## How it benefits the platform
* **Performance:** Removing 5 web fonts drastically improves Time to First Byte (TTFB) and overall page load speed.
* **Consistency:** The entire app now consistently inherits `bg-background` and `text-foreground` directly from the Shadcn preset. Standard pages and complex Shadcn components (Cards, Dialogs) now share the exact same visual identity.
* **Maintainability:** Any future brand color or theme updates can be applied instantly across the entire platform by running the Shadcn CLI and updating a single file.
