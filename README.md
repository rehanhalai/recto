# Recto

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-000000?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=flat-square&logo=nestjs)
![Turborepo](https://img.shields.io/badge/Turborepo-2.5-EF4444?style=flat-square&logo=turborepo)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

**A social reading platform. Think Letterboxd, but for books.**

Live at → [recto.social](https://recto.social)

---

## What is Recto?

Recto is a social reading platform built for people who take books seriously. You track what you've read, discover what's next, and connect with readers who share your taste — without the noise of algorithm-driven recommendations or corporate book clubs.

Unlike Goodreads, which is bloated and aging, or StoryGraph, which leans analytics-first, Recto is built around the social layer: posts about books, curated lists, following readers whose taste you trust, and a feed that surfaces the books people are actually talking about right now. It's closer to the way Letterboxd made film logging feel personal and cultural — applied to reading.

The design reflects the medium. A warm parchment palette ("Literary Dusk"), Playfair Display headings, and a paper-grain texture make the experience feel genuinely bookish — not just a generic CRUD app with a reading theme.

---

## Monorepo Structure

```
recto/
├── apps/
│   ├── client/          # Next.js 16 frontend (App Router)
│   └── server/          # NestJS 11 backend API
├── packages/
│   ├── types/           # Shared TypeScript types (Drizzle InferSelectModel patterns)
│   └── assets/          # Shared logos, images, fonts
├── turbo.json           # Turborepo task pipeline
└── pnpm-workspace.yaml  # pnpm workspace config
```

---

## Tech Stack

| Layer       | Technology               | Why                                                                 |
|-------------|--------------------------|---------------------------------------------------------------------|
| Frontend    | Next.js 16 (App Router)  | RSC, file-based routing, Vercel-native deployment                   |
| Backend     | NestJS 11                | Structured DI, decorator-based guards, module system scales cleanly |
| Database    | PostgreSQL via Neon       | Serverless Postgres, no connection management overhead               |
| ORM         | Drizzle ORM              | Type-safe SQL, schema-as-code, faster than Prisma at runtime        |
| Auth        | JWT + DB sessions        | Cookie-based JWT with server-side session revocation                |
| Hosting     | Vercel (client)          | Zero-config Next.js deployment                                      |
| Hosting     | Azure App Service (API)  | Docker container deployment, region: centralindia                   |
| Media       | Cloudinary               | Image upload, transformation, and CDN delivery                      |
| State       | TanStack Query v5        | Server state, cursor pagination, cache invalidation                 |
| Monorepo    | Turborepo + pnpm         | Parallel builds, smart caching, workspace dependency hoisting        |
| Emails      | Nodemailer (SMTP)        | Welcome emails, OTP delivery, password reset links                  |

---

## Getting Started

### Prerequisites

- **Node.js** 22+
- **pnpm** 9.15.0 (`npm install -g pnpm@9.15.0`)
- A **PostgreSQL** database (Neon recommended — free tier works)
- A **Cloudinary** account (free tier works for development)
- A **Google OAuth** app for social login
- An SMTP provider for email (Gmail app passwords work)

### Installation

```bash
# Clone the repo
git clone https://github.com/rehanhalai/recto.git
cd recto

# Install all workspace dependencies
pnpm install
```

### Environment Variables

**Client** (`apps/client/.env.local`):

| Variable                 | Required | Description                              |
|--------------------------|----------|------------------------------------------|
| `NEXT_PUBLIC_API_URL`    | Yes      | Backend API base URL (e.g. `http://localhost:8080/api`) |

**Server** (`apps/server/.env`):

| Variable                  | Required | Description                                          |
|---------------------------|----------|------------------------------------------------------|
| `PORT`                    | No       | Server port (default: `8080`)                        |
| `NODE_ENV`                | No       | `development` or `production`                        |
| `DATABASE_URL`            | Yes      | PostgreSQL connection string                         |
| `CLIENT_URL`              | Yes      | Frontend origin for CORS (e.g. `http://localhost:3000`) |
| `REFRESH_TOKEN_SECRET`    | Yes      | Secret for signing JWT session tokens                |
| `REFRESH_TOKEN_EXPIRE`    | No       | Token expiry (default: `30d`)                        |
| `CLOUDINARY_CLOUD_NAME`   | Yes      | Cloudinary cloud name                                |
| `CLOUDINARY_API_KEY`      | Yes      | Cloudinary API key                                   |
| `CLOUDINARY_API_SECRET`   | Yes      | Cloudinary API secret                                |
| `GOOGLE_CLIENT_ID`        | Yes      | Google OAuth client ID                               |
| `GOOGLE_CLIENT_SECRET`    | Yes      | Google OAuth client secret                           |
| `GOOGLE_CALLBACK_URL`     | Yes      | Google OAuth callback (e.g. `http://localhost:8080/api/auth/google/callback`) |
| `SMTP_HOST`               | Yes      | SMTP host (e.g. `smtp.gmail.com`)                    |
| `SMTP_PORT`               | Yes      | SMTP port (e.g. `587`)                               |
| `SMTP_USER`               | Yes      | SMTP username / email address                        |
| `SMTP_PASS`               | Yes      | SMTP password or app password                        |
| `SMTP_FROM`               | Yes      | Sender display name and address                      |
| `AMAZON_ASSOCIATE_TAG`    | No       | Amazon Associates tag for affiliate links            |

Copy the example files to get started:

```bash
cp apps/client/.env.example apps/client/.env.local
cp apps/server/.env.example apps/server/.env
```

### Running Locally

```bash
# Run everything (client + server) in parallel
pnpm dev

# Run only the client
pnpm --filter @recto/client dev

# Run only the server
pnpm --filter @recto/server dev
```

The client runs at `http://localhost:3000` and the server at `http://localhost:8080`.

To apply database migrations on first run:

```bash
cd apps/server
pnpm dlx drizzle-kit push
```

---

## Architecture Overview

```
Browser
  │
  └─► Next.js Client (Vercel)
        │  credentials: include (cookies)
        │
        └─► NestJS API (Azure App Service)
              │  AuthGuard: cookie → JWT verify → session DB lookup
              │
              ├─► Neon PostgreSQL (Drizzle ORM)
              │     users, sessions, books, posts, reviews, lists, ...
              │
              ├─► Google Books API (book search + detail)
              │
              └─► Cloudinary (avatar, cover, post images)
```

Auth is cookie-based. The client sends all requests with `credentials: "include"`. The server issues a JWT stored in an `httpOnly` cookie (`session_id`). Every authenticated request verifies the JWT, then validates the session record in the database — giving the ability to invalidate sessions server-side.

---

## Apps

| App       | Path          | Description                                                       |
|-----------|---------------|-------------------------------------------------------------------|
| `client`  | `apps/client` | Next.js 16 App Router frontend. See [apps/client/README.md](apps/client/README.md). |
| `server`  | `apps/server` | NestJS 11 API server. See [apps/server/README.md](apps/server/README.md). |

## Packages

| Package         | Path               | Description                                                           |
|-----------------|--------------------|-----------------------------------------------------------------------|
| `@recto/types`  | `packages/types`   | Shared TypeScript types inferred from Drizzle schema via `InferSelectModel` |
| `@recto/assets` | `packages/assets`  | Shared logos, images, and fonts consumed by both apps                 |

---

## Deployment

| App    | Platform         | Details                                          |
|--------|------------------|--------------------------------------------------|
| Client | Vercel           | Automatic deploys on push to `main`              |
| Server | Azure App Service | Docker container, region: `centralindia`, exposed on `api.recto.social` |

The server Dockerfile is a two-stage build: builder stage compiles TypeScript with NestJS CLI, runner stage copies the `dist/` output and runs `node dist/main.js`.

CI/CD is not yet configured in `.github/workflows`.

---

## Contributing

1. Fork and clone the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Install dependencies: `pnpm install`
4. Make your changes and test locally
5. Open a pull request against `main`

Please follow the existing code style — Prettier is configured at the root.

---

## License

ISC — see [LICENSE](LICENSE).
