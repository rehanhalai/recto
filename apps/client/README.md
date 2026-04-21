# Recto — Web Client

Next.js 16 App Router frontend for Recto, a social reading platform.

---

## Overview

This app is the browser-facing side of Recto. It handles everything users see and interact with: the landing page, auth flows, the social feed, book discovery, reading tracking, reviews, lists, profiles, and search. It communicates exclusively with the Recto API server via an `apiInstance` wrapper that always sends cookies.

---

## Tech Stack

| Technology               | Usage                                                                 |
|--------------------------|-----------------------------------------------------------------------|
| **Next.js 16.1.1**       | App Router, RSC, file-based routing, Turbopack in dev                 |
| **React 19**             | UI framework                                                          |
| **Tailwind CSS v4**      | Utility-first styling with CSS variables for the design system        |
| **shadcn/ui (new-york)** | Base UI primitives (dialogs, dropdowns, tabs, scroll areas, etc.)     |
| **Radix UI**             | Headless primitives underlying shadcn/ui                              |
| **TanStack Query v5**    | Server state management — all data fetching, mutations, cache control |
| **Zustand v5**           | Client-only auth state (persisted to `localStorage`)                  |
| **Phosphor Icons**       | Primary icon library (`@phosphor-icons/react`)                        |
| **Lucide React**         | Secondary icon library (used by shadcn/ui components)                 |
| **GSAP 3**               | Scroll-triggered animations on the landing page                       |
| **Lenis**                | Smooth scroll on the landing page                                     |
| **Cloudinary**           | Avatar/cover/post image uploads (via server-side upload endpoint)     |
| **Embla Carousel**       | Book strip carousel on the landing page                               |
| **React Hook Form + Zod**| Form validation across auth and profile edit flows                    |
| **React Easy Crop**      | Avatar and cover image cropping before upload                         |
| **react-intersection-observer** | Infinite scroll trigger for paginated feeds                  |

---

## Project Structure

```
apps/client/src/
├── app/                    # Route tree only — minimal logic, no business logic here
│   ├── page.tsx            # Landing page (/)
│   ├── layout.tsx          # Root layout: fonts, ThemeProvider, QueryClientProvider
│   ├── globals.css         # Design system: CSS variables, Tailwind theme, typography
│   ├── (app)/              # Authenticated app shell
│   │   ├── layout.tsx      # App layout (sidebar, navigation)
│   │   ├── feed/           # /feed
│   │   ├── browse/         # /browse
│   │   ├── book/[id]/      # /book/:sourceId/:slug
│   │   ├── list/[id]/      # /list/:listId
│   │   ├── posts/          # /posts
│   │   ├── search/         # /search
│   │   ├── notifications/  # /notifications
│   │   ├── settings/       # /settings
│   │   └── (profile)/
│   │       ├── profile/    # /profile (own profile)
│   │       └── [username]/ # /:username (public profile)
│   └── (auth)/             # Unauthenticated auth shell
│       ├── login/          # /login
│       ├── signup/         # /signup
│       ├── forgot-password/ # /forgot-password
│       ├── reset-password/  # /reset-password
│       └── google-callback/ # /google-callback
├── features/               # Feature modules — all business logic lives here
│   ├── auth/               # Login, signup, OTP verification, password reset
│   ├── book/               # Book detail, shelf controls, reviews, affiliate links
│   ├── feed/               # Explore feed, following feed, post cards
│   ├── home/               # Feed page composition
│   ├── landing/            # Landing page components (hero, book strip)
│   ├── list/               # List detail page, add-to-list sheet
│   ├── navigation/         # Top nav, bottom nav
│   ├── notifications/      # Notifications list
│   ├── profile/            # User profile, reading shelves, posts tab
│   ├── search/             # Global search (users, books, lists)
│   └── sidebar/            # Desktop sidebar
├── components/             # Shared, reusable UI components
│   ├── layout/             # StandardLayout, sidebars, footer
│   ├── providers/          # ThemeProvider
│   ├── ui/                 # shadcn/ui components
│   ├── UserAvatar.tsx      # Avatar with Cloudinary image
│   ├── StarRating.tsx      # 1–5 star display component
│   ├── ReadingStatusBadge.tsx # Wishlist/Reading/Finished badge
│   ├── avatar-image-picker.tsx # Crop + upload avatar
│   └── cover-image-picker.tsx  # Crop + upload cover image
├── lib/                    # Utilities and API client
│   ├── api.ts              # apiInstance (fetch wrapper, cookie-based)
│   ├── book-urls.ts        # getBookUrl(sourceId, title) → /book/:id/:slug
│   ├── cookies.ts          # Cookie read utilities
│   ├── deduplicate.ts      # Array deduplication helper
│   ├── format-relative-time.ts # "2 hours ago" formatting
│   ├── image-crop.ts       # Canvas-based crop output
│   ├── toast.ts            # Toast notification helpers
│   └── utils.ts            # clsx/tailwind-merge cn() utility
├── hooks/
│   └── use-media-query.ts  # Responsive breakpoint hook
├── store/
│   └── auth.store.ts       # Zustand store: { user, isAuthenticated, setUser }
├── constants/
│   └── genres.ts           # Curated genre list for UI
├── config.ts               # NEXT_PUBLIC_API_URL + genre utilities
└── provider.tsx            # TanStack QueryClientProvider
```

---

## Routing

| Route                   | What it renders                                                      |
|-------------------------|----------------------------------------------------------------------|
| `/`                     | Landing page with hero scroll sequence, GSAP animations              |
| `/feed`                 | Explore feed (all posts) + following feed tab                        |
| `/browse`               | Trending books and discovery                                         |
| `/book/:sourceId/:slug` | Book detail: metadata, ratings, shelf controls, reviews, affiliate links |
| `/list/:listId`         | Curated book list detail (Spotify-inspired header)                   |
| `/posts`                | Individual post view                                                 |
| `/search`               | Global search across users, books, and lists                         |
| `/notifications`        | User notifications                                                   |
| `/settings`             | Account settings                                                     |
| `/profile`              | Own user profile                                                     |
| `/:username`            | Public user profile with posts, reviews, and shelves                 |
| `/login`                | Email/password sign-in                                               |
| `/signup`               | Email registration with OTP verification                              |
| `/forgot-password`      | Password reset request                                               |
| `/reset-password`       | New password via reset token                                         |
| `/google-callback`      | Google OAuth redirect handler                                        |

---

## Features

### Feed

Two tabs: **Explore** (all posts, global) and **Following** (posts from users you follow).

Both use cursor-based infinite scroll. Cursors are ISO timestamp strings (and post ID for explore's tie-breaking). `react-intersection-observer` triggers `fetchNextPage` when the bottom sentinel enters the viewport. TanStack Query's `useInfiniteQuery` manages the page stack.

### Browse / Trending

Displays books ranked by post mention frequency over the last 30 days. Falls back to recent books if no trending data exists.

### Book Detail

URL structure: `/book/:sourceId/:slug` where `sourceId` is the Google Books volume ID.

- **Shelf controls**: Add/move a book between Wishlist, Currently Reading, and Finished. Enforces a 20-book limit per shelf (server-enforced, surfaced to the client as an error toast).
- **Reviews**: Star rating (1–5) + optional text review. One review per user per book. Users can edit or delete their own review.
- **Affiliate links**: Loaded lazily on demand. Links to Amazon (country-aware domain), AbeBooks, and Bookshop.org. Requires ISBN-13 to be present on the book record.
- **Stats**: Reader count, review count, list count, rating distribution histogram, average rating — all fetched from `/api/book/stats/:bookId`.
- **Community lists**: Lists containing this book, fetched from `/api/lists?bookId=...`.

### Lists

Users create named, optionally public/private lists of books. The list detail page shows a rich header with cover art, stats, and a table of books with authors and rating. Books can be added or removed by the list owner.

### Search

Unified search at `GET /api/search?q=...&type=all|users|books|lists`. The "all" mode runs three parallel queries and returns combined results. The client shows tabbed results for each type.

### Auth

Recto uses two auth methods:
1. **Email + OTP**: Signup sends an OTP to the user's email. Correct OTP creates the account and issues a session cookie.
2. **Google OAuth**: Redirect-based flow via Passport.js strategy. On success, the server sets the session cookie and redirects to `/feed`.

The client stores minimal user state (`{ id, userName, avatarImage, isAuthenticated }`) in a Zustand store persisted to `localStorage` under the key `auth-storage`. The landing page reads this to redirect already-authenticated users directly to `/feed`.

On any 401 response, the `apiInstance` dispatches a custom `auth:unauthorized` event, which the auth provider listens to and clears session state.

### Profile

Displays the user's posts (with pagination), reading shelves (wishlist, currently reading, finished), and reviews. Public profiles are accessible at `/:username` without authentication.

Users can edit their profile (username, full name, bio) and update their avatar and cover image. Image editing uses `react-easy-crop` to crop before uploading via multipart form to `/api/user/update-profileimage`.

---

## API Client

All API calls go through `apiInstance` defined in `src/lib/api.ts`:

```typescript
export const apiInstance = {
  get:    <T>(endpoint, params?) => request<T>("GET",    endpoint, { params }),
  post:   <T>(endpoint, body?)   => request<T>("POST",   endpoint, { body }),
  patch:  <T>(endpoint, body?)   => request<T>("PATCH",  endpoint, { body }),
  delete: <T>(endpoint)          => request<T>("DELETE", endpoint),
};
```

Key behaviour:
- **`credentials: "include"`** on every request — sends the `session_id` httpOnly cookie automatically
- FormData bodies skip the `Content-Type: application/json` header (browser sets multipart boundary)
- 401 responses dispatch `auth:unauthorized` to trigger client-side logout
- Base URL from `NEXT_PUBLIC_API_URL` env var (default: `http://localhost:8080/api`)

---

## State Management

TanStack Query v5 handles all server state. A single `QueryClient` is created via `useState` in `provider.tsx` to prevent re-instantiation on re-renders.

Zustand (`useAuthStore`) handles client-only auth state. It is persisted to `localStorage` so the landing page can detect existing sessions on first load without a network request.

---

## Design System

The design system is called **Literary Dusk** and is defined entirely in `src/app/globals.css` using Tailwind v4 CSS variables.

### Color Palette

```css
/* Light mode */
--paper: #faf7f2;       /* Page background — warm cream */
--card:  #f3ede3;       /* Card surface — warm ecru */
--ink:   #1c1814;       /* Primary text — deep warm ink */
--ink-muted: #78695a;   /* Secondary text — warm taupe */
--border-subtle: #e0d8cc; /* Dividers */
--gold: #c9a96e;        /* Accent — Literary Dusk gold */
--gold-muted: #a0804e;  /* Dimmer gold */

/* Dark mode ("Midnight Library") */
--paper: #0e0d0a;       /* Near-black with warm brown undertone */
--card:  #181510;       /* Warm dark brown */
--ink:   #ede8df;       /* Warm cream text */
--ink-muted: #9a8b7a;   /* Warm muted tan */
--border-subtle: #2a2520;
```

There is also a full Tea Green / Beige / Cornsilk / Papaya Whip / Light Bronze palette defined as CSS custom properties for use in specific components.

The body has a very subtle SVG paper-grain `background-image` (2% opacity light, 3.5% dark) for texture.

### Typography

| Font                | Variable                 | Usage                            |
|---------------------|--------------------------|----------------------------------|
| **DM Sans**         | `--font-dm-sans`         | Body text (sans-serif)           |
| **Playfair Display**| `--font-playfair-display`| Headings (h1–h6 via `font-serif`) |
| **Cormorant Garamond** | `--font-cormorant`    | Literary quotes, italic accents  |
| **Geist Mono**      | `--font-geist-mono`      | Code/monospace                   |

### Icon Libraries

- **Phosphor Icons** (`@phosphor-icons/react`) — primary icons throughout the app
- **Lucide React** — used internally by shadcn/ui components

### shadcn/ui

Configured with the `new-york` style variant, `neutral` base color, and CSS variables mode. Components in use include: Accordion, AlertDialog, Avatar, Dialog, DropdownMenu, Label, Progress, ScrollArea, Separator, Slot, Tabs.

Custom components (e.g. `UserAvatar`, `StarRating`, `ReadingStatusBadge`) sit next to shadcn components in `src/components/`.

### Animations

- **GSAP 3 + ScrollTrigger**: Landing page section entrances — subtitle, heading, and feature cards animate in with `opacity`/`y` on scroll. Disabled on mobile/tablet to prevent jank.
- **Lenis**: Smooth scroll on the landing page only.
- **Embla Carousel**: Auto-scrolling book strip on the landing page.
- **tw-animate-css**: Tailwind-compatible CSS animation classes for micro-interactions.

---

## Environment Variables

| Variable              | Required | Description                                          |
|-----------------------|----------|------------------------------------------------------|
| `NEXT_PUBLIC_API_URL` | Yes      | Backend API base URL (`http://localhost:8080/api`)   |

---

## Running Locally

```bash
# From monorepo root
pnpm dev

# Or from this directory
pnpm dev
```

The client runs at `http://localhost:3000`. Requires the server to be running at the `NEXT_PUBLIC_API_URL`.

---

## Deployment

Deployed to **Vercel**. Next.js config (`next.config.ts`) sets:

- `outputFileTracingRoot` to the monorepo root (required for workspace packages)
- `turbopack.root` to the monorepo root
- `experimental.optimizeCss: true`
- Remote image patterns for: `covers.openlibrary.org`, `books.google.com`, `res.cloudinary.com`, `lh3.googleusercontent.com`

No custom `vercel.json` is required — Vercel auto-detects Next.js.
