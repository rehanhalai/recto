# Recto — API Server

NestJS 11 backend powering Recto's social reading platform.

---

## Overview

This app is the API layer for Recto. It handles authentication, book data (sourced from Google Books API and cached in PostgreSQL), user profiles, social follows, a cursor-paginated post feed, book reviews, reading tracker (shelves), curated lists, image uploads, and a unified search endpoint. It runs as a Docker container on Azure App Service and is publicly accessible at `api.recto.social`.

---

## Tech Stack

| Technology          | Usage                                                              |
|---------------------|--------------------------------------------------------------------|
| **NestJS 11**       | Module-based DI framework, decorators, guards, interceptors        |
| **Drizzle ORM**     | Type-safe SQL queries, schema-as-code, migrations via drizzle-kit  |
| **PostgreSQL / Neon** | Serverless PostgreSQL, connected via `postgres-js` driver         |
| **JSON Web Tokens** | Session token signing and verification (`jsonwebtoken`)            |
| **bcrypt**          | Password hashing                                                   |
| **Passport.js**     | Google OAuth 2.0 strategy                                          |
| **Cloudinary**      | Image storage and CDN (avatars, cover images, post images)         |
| **Nodemailer**      | Transactional email (OTP, welcome, password reset)                 |
| **Google Books API**| Primary book search and detail data source                         |
| **express-rate-limit** | Rate limiting (30 req/15min on auth, 300 req/15min global)      |

---

## Project Structure

```
apps/server/src/
├── main.ts                  # Bootstrap: CORS, global prefix, rate limits, cookie-parser
├── app.module.ts            # Root module — imports all feature modules
├── config/
│   └── config.ts            # ConfigService factory (reads env vars)
├── constants/
│   └── index.ts             # SESSION_EXPIRE_TIME, SESSION_COOKIE_NAME, USER_SELECT_FIELDS
├── common/
│   ├── guards/
│   │   ├── auth.guard.ts         # JWT verify + session DB lookup → req.user
│   │   └── optional-auth.guard.ts # Same flow but doesn't throw on missing token
│   └── pipes/
│       └── file-validator.pipeline.ts
└── modules/
    ├── auth/                # Registration (OTP flow), sign-in, Google OAuth, logout
    ├── user/                # Profile CRUD, follow/unfollow, username search
    ├── book/                # Book search, detail, trending, stats, affiliate links
    │   ├── clients/         # GoogleBooksClient (HTTP wrapper)
    │   ├── services/        # BookService, BookQueryService, BookSearchService, AffiliateService
    │   └── utils/           # google-books.normalizer.ts (ISBN-13 extraction, volume mapping)
    ├── posts/               # Post CRUD, feed (explore + following), likes, comments
    ├── review/              # Book reviews — one per user per book, rating 1–5
    ├── reading-tracker/     # Shelf management (wishlist / reading / finished)
    ├── lists/               # Curated book lists — create, manage, search
    ├── search/              # Unified search: users + books + lists
    ├── upload/              # File upload endpoint (delegates to StorageService)
    ├── storage/             # Cloudinary provider abstraction (StorageService)
    ├── mail/                # MailService (welcome, OTP, password reset emails)
    └── otp/                 # OTP generation, hashing, verification, expiry

db/
├── schema/
│   ├── users.ts         # users, sessions, otps, followers
│   ├── books.ts         # books, book_authors, genres, book_genres
│   ├── interactions.ts  # added_books, book_reviews, review_likes, book_lists, book_list_items
│   └── content.ts       # posts, post_likes, post_comments, post_comment_likes, blogs
├── migrations/          # Drizzle-generated SQL migrations
└── db.module.ts         # Global DRIZZLE injection token (postgres-js + drizzle)
```

---

## Database Schema

### `users`

| Column            | Type        | Description                                        |
|-------------------|-------------|----------------------------------------------------|
| `id`              | varchar(255)| Primary key (UUID)                                 |
| `user_name`       | varchar(50) | Unique username                                    |
| `full_name`       | varchar(100)| Display name (optional)                            |
| `email`           | varchar(255)| Unique email                                       |
| `google_id`       | varchar(255)| Google OAuth subject ID (nullable)                 |
| `hashed_password` | text        | bcrypt hash (nullable for pure Google accounts)    |
| `bio`             | varchar(300)| Profile bio                                        |
| `avatar_image`    | text        | Cloudinary avatar URL                              |
| `avatar_public_id`| text        | Cloudinary public ID for deletion                  |
| `cover_image`     | text        | Cloudinary cover image URL                         |
| `cover_public_id` | text        | Cloudinary public ID for deletion                  |
| `role`            | enum        | `user` \| `admin` \| `moderator` (default: `user`) |
| `is_verified`     | boolean     | Email or Google-verified flag                      |
| `follower_count`  | integer     | Denormalized count (default: 0)                    |
| `following_count` | integer     | Denormalized count (default: 0)                    |
| `created_at`      | timestamptz | Row creation time                                  |
| `updated_at`      | timestamptz | Last update time                                   |

### `sessions`

| Column       | Type        | Description                                        |
|--------------|-------------|----------------------------------------------------|
| `id`         | varchar(255)| Primary key — this is the `sid` in the JWT payload |
| `user_id`    | varchar(255)| FK → `users.id` (cascade delete)                  |
| `user_agent` | varchar(500)| Browser user-agent string                          |
| `ip_address` | varchar(50) | Client IP                                          |
| `expires_at` | timestamptz | Session expiry (7 days from creation)              |
| `created_at` | timestamptz | Creation time                                      |

### `otps`

| Column            | Type        | Description                                        |
|-------------------|-------------|----------------------------------------------------|
| `id`              | varchar(255)| Primary key (UUID)                                 |
| `email`           | varchar(255)| Email address the OTP was sent to                  |
| `hashed_code`     | text        | bcrypt hash of the 6-digit OTP                     |
| `hashed_password` | text        | Temp storage of hashed password during signup OTP  |
| `expires_at`      | timestamptz | OTP expiry time                                    |

### `followers`

| Column        | Type        | Description                                        |
|---------------|-------------|----------------------------------------------------|
| `id`          | varchar(255)| Primary key (UUID)                                 |
| `follower_id` | varchar(255)| FK → `users.id` — the user doing the following    |
| `following_id`| varchar(255)| FK → `users.id` — the user being followed         |
| `created_at`  | timestamptz | Follow creation time                               |

Unique index on `(follower_id, following_id)`. Check constraint prevents self-follows: `follower_id != following_id`.

### `books`

| Column           | Type                     | Description                              |
|------------------|--------------------------|------------------------------------------|
| `id`             | varchar(255)             | Primary key (UUID)                       |
| `source_id`      | varchar(255)             | External provider ID (e.g. Google Books volume ID) |
| `source`         | enum                     | `google_books` \| `open_library` \| `manual` |
| `title`          | varchar(255)             | Book title                               |
| `subtitle`       | varchar(255)             | Subtitle (nullable)                      |
| `release_date`   | varchar(50)              | Publication date string                  |
| `description`    | text                     | Book description                         |
| `page_count`     | integer                  | Number of pages                          |
| `language`       | varchar(10)              | Language code (e.g. `en`)               |
| `isbn13`         | varchar(13)              | ISBN-13 (nullable — used for affiliate links) |
| `average_rating` | numeric(3,2)             | Maintained via Postgres trigger          |
| `ratings_count`  | integer                  | Maintained via Postgres trigger          |
| `cover_image`    | text                     | Book cover image URL                     |
| `created_at`     | timestamptz              | Row creation time                        |
| `updated_at`     | timestamptz              | Last update time                         |

Unique index on `(source, source_id)` — prevents duplicate book records across sources.

### `book_authors`

| Column        | Type        | Description                          |
|---------------|-------------|--------------------------------------|
| `id`          | varchar(255)| Primary key (UUID)                   |
| `book_id`     | varchar(255)| FK → `books.id` (cascade delete)    |
| `author_name` | varchar(255)| Author name string                   |

### `genres` / `book_genres`

`genres`: master list of genre slugs and display names, grown from Google Books category data.  
`book_genres`: join table linking books to genres (unique on `(book_id, genre_id)`).

### `added_books`

| Column       | Type           | Description                                            |
|--------------|----------------|--------------------------------------------------------|
| `id`         | varchar(255)   | Primary key (UUID)                                     |
| `user_id`    | varchar(255)   | FK → `users.id` (cascade delete)                      |
| `book_id`    | varchar(255)   | FK → `books.id` (cascade delete)                      |
| `status`     | enum           | `wishlist` \| `reading` \| `finished`                  |
| `started_at` | timestamptz    | When the user started reading (nullable)               |
| `finished_at`| timestamptz    | When the user finished (nullable)                      |
| `created_at` | timestamptz    | Row creation time                                      |
| `updated_at` | timestamptz    | Last status change time                                |

Unique index on `(user_id, book_id)` — one shelf entry per user per book. Check constraint: `status != 'finished' OR finished_at IS NOT NULL`.

### `book_reviews`

| Column              | Type        | Description                                        |
|---------------------|-------------|----------------------------------------------------|
| `id`                | varchar(255)| Primary key (UUID)                                 |
| `user_id`           | varchar(255)| FK → `users.id` (cascade delete)                  |
| `book_id`           | varchar(255)| FK → `books.id` (cascade delete)                  |
| `content`           | text        | Review text (optional — rating is required)         |
| `rating`            | smallint    | 1–5 star rating                                    |
| `contains_spoilers` | boolean     | Spoiler flag (default: false)                      |
| `likes_count`       | integer     | Denormalized like count                            |
| `created_at`        | timestamptz | Review creation time                               |
| `updated_at`        | timestamptz | Last edit time                                     |

Unique index on `(user_id, book_id)` — one review per user per book.

### `review_likes`

Join table for users liking reviews. Unique on `(review_id, user_id)`.

### `book_lists`

| Column        | Type        | Description                            |
|---------------|-------------|----------------------------------------|
| `id`          | varchar(255)| Primary key (UUID)                     |
| `user_id`     | varchar(255)| FK → `users.id` (cascade delete)      |
| `name`        | varchar(100)| List name                              |
| `description` | varchar(500)| Optional description                   |
| `is_public`   | boolean     | Visibility flag (default: true)        |
| `book_count`  | integer     | Denormalized count (default: 0)        |
| `created_at`  | timestamptz | Creation time                          |
| `updated_at`  | timestamptz | Last update time                       |

### `book_list_items`

Join table linking books to lists. Unique on `(list_id, book_id)`.

### `posts`

| Column           | Type        | Description                                        |
|------------------|-------------|----------------------------------------------------|
| `id`             | varchar(255)| Primary key (UUID)                                 |
| `author_id`      | varchar(255)| FK → `users.id` (cascade delete)                  |
| `book_id`        | varchar(255)| FK → `books.id` (set null on delete) — optional   |
| `content`        | varchar(500)| Post text                                          |
| `image`          | text        | Post image URL (Cloudinary)                        |
| `likes_count`    | integer     | Denormalized like count                            |
| `comments_count` | integer     | Denormalized comment count                         |
| `created_at`     | timestamptz | Post creation time                                 |
| `updated_at`     | timestamptz | Last edit time                                     |

### `post_likes` / `post_comments` / `post_comment_likes`

- `post_likes`: join table (unique on `(user_id, post_id)`)
- `post_comments`: nested comments with `parent_id` self-reference
- `post_comment_likes`: join table for comment likes

### `blogs`

| Column       | Type        | Description                                |
|--------------|-------------|--------------------------------------------|
| `id`         | varchar(255)| Primary key (UUID)                         |
| `author_id`  | varchar(255)| FK → `users.id` (cascade delete)          |
| `title`      | varchar(200)| Blog title                                 |
| `slug`       | varchar(255)| Unique URL slug                            |
| `cover_image`| text        | Optional cover image URL                   |
| `content`    | text        | Full blog content                          |
| `is_published`| boolean    | Published flag (default: false)            |

---

## Authentication

Auth is two-layer: JWT for stateless verification + database session for revocation.

### Full flow

**1. Registration (email + OTP)**
```
POST /api/auth/signup
  → validate email uniqueness
  → hash password with bcrypt (10 rounds)
  → generate 6-digit OTP, hash it, store in otps table
  → send OTP email via Nodemailer

POST /api/auth/signup-verify
  → verify OTP hash matches
  → create user record in transaction
  → create session record → get session.id
  → sign JWT: { sub: userId, sid: sessionId }
  → set httpOnly cookie: session_id = JWT
```

**2. Sign-in**
```
POST /api/auth/signin
  → find user by email
  → compare password with bcrypt
  → create session record
  → sign JWT with { sub: userId, sid: sessionId }
  → set httpOnly cookie: session_id = JWT
```

**3. Google OAuth**
```
GET  /api/auth/google         → Passport redirects to Google consent
GET  /api/auth/google/callback → Google redirects back with code
  → Passport exchanges code for profile
  → Upsert user (create if new, patch googleId/avatar if needed)
  → Create session → sign JWT → set cookie → redirect to /feed
```

**4. Per-request guard (AuthGuard)**
```
1. Extract JWT from cookies[session_id]
2. jwt.verify(token, secret) → { sub: userId, sid: sessionId }
3. Query sessions WHERE id = sid AND user_id = userId AND expires_at > NOW()
4. If session not found → 401 (session revoked or expired)
5. Query users WHERE id = userId
6. Attach { id, sessionId, role } to req.user
```

**5. Logout**
```
POST /api/auth/logout
  → delete session record from DB (revokeSession)
  → clearCookie(session_id)
```

**Why two layers?** JWT alone can't be invalidated before expiry. The session table gives server-side revocation on logout. JWT expiry (configured via `REFRESH_TOKEN_EXPIRE`, default `30d`) is the hard cap; the session record is the revocable layer.

**Session TTL**: `SESSION_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000` (7 days in milliseconds). Sessions are stored with an `expires_at` timestamp and checked on every request.

---

## API Endpoints

### Auth — `POST|GET /api/auth/...`

| Method | Path                        | Auth     | Description                                        |
|--------|-----------------------------|----------|----------------------------------------------------|
| POST   | `/auth/signup`              | None     | Register — sends OTP email                         |
| POST   | `/auth/signup-verify`       | None     | Verify OTP → create account + set session cookie   |
| POST   | `/auth/signin`              | None     | Email/password login → set session cookie          |
| POST   | `/auth/logout`              | Required | Revoke session + clear cookie                      |
| POST   | `/auth/forgot-password`     | None     | Send password reset link via email                 |
| POST   | `/auth/reset-password`      | None     | Set new password via reset token                   |
| POST   | `/auth/change-password`     | Required | Change password with old password verification     |
| GET    | `/auth/google`              | None     | Redirect to Google consent screen                  |
| GET    | `/auth/google/callback`     | None     | Google OAuth callback → set cookie → redirect      |
| GET    | `/auth/me`                  | Required | Get current authenticated user data                |

### Users — `GET|POST|PATCH|DELETE /api/user/...`

| Method | Path                          | Auth     | Description                                     |
|--------|-------------------------------|----------|-------------------------------------------------|
| PATCH  | `/user/update-profile`        | Required | Update username, fullName, bio                  |
| PATCH  | `/user/update-profileimage`   | Required | Upload avatar + cover image (multipart)         |
| GET    | `/user/check`                 | None     | Check username availability                     |
| GET    | `/user/generate-username`     | None     | Generate a random username suggestion           |
| GET    | `/user/whoami`                | Required | Get full profile for the current user           |
| GET    | `/user/search`                | None     | Search users by username (ILIKE)                |
| GET    | `/user/profile`               | Optional | Get public profile by username                  |
| GET    | `/user/profile/followers`     | None     | Cursor-paginated followers for a username       |
| GET    | `/user/profile/following`     | None     | Cursor-paginated following for a username       |
| POST   | `/user/follow/:targetUserId`  | Required | Follow a user                                   |
| DELETE | `/user/follow/:targetUserId`  | Required | Unfollow a user                                 |

### Books — `GET /api/book/...`

| Method | Path                          | Auth     | Description                                          |
|--------|-------------------------------|----------|------------------------------------------------------|
| GET    | `/book/trending`              | None     | Top books by post mention count (last 30 days)       |
| GET    | `/book/affiliate-links/:bookId` | None   | Affiliate links for Amazon, AbeBooks, Bookshop.org   |
| GET    | `/book/stats/:bookId`         | None     | Reader count, review count, rating distribution      |
| GET    | `/book/search`                | None     | Search books via Google Books API                    |
| GET    | `/book/:volumeId`             | None     | Get/cache book by Google Books volume ID             |

### Posts — `GET|POST|PATCH|DELETE /api/posts/...`

| Method | Path                              | Auth     | Description                                    |
|--------|-----------------------------------|----------|------------------------------------------------|
| POST   | `/posts`                          | Required | Create post (text + optional image)            |
| GET    | `/posts/feed`                     | Optional | Explore feed — all posts, cursor paginated     |
| GET    | `/posts/following`                | Required | Following feed — cursor paginated              |
| GET    | `/posts/me`                       | Required | Current user's posts — cursor paginated        |
| GET    | `/posts/user/:authorId`           | Optional | Author's posts — cursor paginated              |
| GET    | `/posts`                          | Optional | All posts (limit 50, no pagination)            |
| GET    | `/posts/:id`                      | Optional | Single post by ID                              |
| PATCH  | `/posts/:id`                      | Required | Edit post                                      |
| DELETE | `/posts/:id`                      | Required | Delete post (author only)                      |
| POST   | `/posts/:id/like`                 | Required | Like a post                                    |
| DELETE | `/posts/:id/like`                 | Required | Unlike a post                                  |
| GET    | `/posts/:id/likes`                | None     | Users who liked a post (page/limit)            |
| GET    | `/posts/:id/comments`             | Optional | Comments on a post (page/limit)                |
| POST   | `/posts/:id/comments`             | Required | Add a comment (supports parentId for replies)  |
| POST   | `/posts/comments/:commentId/like` | Required | Like a comment                                 |
| DELETE | `/posts/comments/:commentId/like` | Required | Unlike a comment                               |

### Reviews — `GET|POST|PATCH|DELETE /api/reviews/...`

| Method | Path                  | Auth     | Description                                        |
|--------|-----------------------|----------|----------------------------------------------------|
| GET    | `/reviews/:bookId`    | Optional | All reviews for a book (page/limit)                |
| POST   | `/reviews/add`        | Required | Create review (bookId, content?, rating 1–5)       |
| PATCH  | `/reviews/:reviewId`  | Required | Update own review                                  |
| DELETE | `/reviews/:reviewId`  | Required | Delete own review (admins can delete any)          |

### Reading Tracker — `GET|POST|DELETE /api/tracker/...`

| Method | Path                      | Auth     | Description                                         |
|--------|---------------------------|----------|-----------------------------------------------------|
| GET    | `/tracker`                | Required | List own shelf entries (status filter required)     |
| GET    | `/tracker/user/:userId`   | None     | List a user's shelf entries (public)                |
| POST   | `/tracker/tbrbook`        | Required | Add/update shelf entry (upsert by bookId)           |
| DELETE | `/tracker/tbrbook/:tbrId` | Required | Remove a shelf entry                                |

### Lists — `GET|POST|PATCH|DELETE /api/lists/...`

| Method | Path                             | Auth     | Description                                         |
|--------|----------------------------------|----------|-----------------------------------------------------|
| GET    | `/lists`                         | None     | Community lists (optionally filtered by bookId)     |
| GET    | `/lists/user/my-lists`           | Required | Current user's lists (optionally filtered by bookId)|
| GET    | `/lists/user/:userId`            | Optional | A user's public lists (or all if owner)             |
| GET    | `/lists/:listId`                 | Optional | List detail with items                              |
| POST   | `/lists`                         | Required | Create a new list                                   |
| PATCH  | `/lists/:listId`                 | Required | Update list name/description/visibility             |
| DELETE | `/lists/:listId`                 | Required | Delete a list                                       |
| POST   | `/lists/:listId/books`           | Required | Add a book to a list                                |
| DELETE | `/lists/:listId/books/:bookId`   | Required | Remove a book from a list                           |

### Search — `GET /api/search`

| Method | Path       | Auth | Description                                                                |
|--------|------------|------|----------------------------------------------------------------------------|
| GET    | `/search`  | None | `?q=...&type=all|users|books|lists` — unified or type-specific search      |

### Upload — `POST /api/upload`

| Method | Path      | Auth     | Description                             |
|--------|-----------|----------|-----------------------------------------|
| POST   | `/upload` | Required | Upload file → Cloudinary (delegates to StorageService) |

---

## Cursor Pagination

Most list endpoints use cursor-based pagination instead of offset-based. This avoids the performance cliff of `OFFSET N` on large tables and handles new items being inserted between pages.

**Feed cursor format** (`getFeed`, `getUserPosts`):  
Cursor is an ISO timestamp string (e.g. `2025-03-21T12:00:00.000Z`). Optionally a composite `timestamp|postId` for tie-breaking in explore feed.

**Following/User cursor format**:  
Pure ISO timestamp (`createdAt` of the last item on the current page).

**Response shape**:
```json
{
  "data": [...],
  "nextCursor": "2025-03-21T11:55:00.000Z",
  "hasMore": true
}
```

The server fetches `limit + 1` rows. If the result length is greater than `limit`, there are more pages and `hasMore` is true. The extra row is sliced off before returning.

---

## Trending Score

The trending algorithm in `BookService.getTrending()` ranks books by **post mention count over the last 30 days**:

```sql
SELECT posts.book_id, COUNT(posts.id) AS mention_count
FROM posts
WHERE posts.created_at > NOW() - INTERVAL '30 days'
  AND posts.book_id IS NOT NULL
GROUP BY posts.book_id
ORDER BY mention_count DESC
LIMIT :limit
```

If no posts have mentioned any books in the last 30 days, the endpoint falls back to the most recently added books in the database.

---

## External Integrations

### Google Books API

All book search and detail calls go through `GoogleBooksClient`. On `GET /api/book/:volumeId`:

1. Check DB by `source_id` (Google Books volume ID) — return cached record if found
2. Fetch from Google Books API
3. Check DB by `isbn13` — deduplication: if a book with the same ISBN exists (possibly from a different source), return the existing record
4. If no cache hit: normalize the volume, insert book + authors + matched genres in a transaction, return the new record

**ISBN-13 deduplication**: The `BookQueryService` extracts ISBN-13 from the Google Books `industryIdentifiers` array before inserting. If a record with that ISBN already exists, it returns the existing record regardless of `sourceId`. This prevents the same physical book from existing as multiple rows.

Book search (`GET /api/book/search`) proxies directly to the Google Books API search endpoint. Results are normalized and deduplicated by `sourceId` in memory.

### Cloudinary

Used for avatar images, cover images, and post images. The `StorageService` wraps a `CloudinaryStorageProvider` behind an `IStorageProvider` interface, so the storage backend can theoretically be swapped without changing calling code.

Asset types and their constraints are defined in `ASSET_CONSTRAINTS`:
- `AVATAR_IMAGE` — per-user bucketing under Cloudinary folder `recto/avatars/:userId`
- `COVER_IMAGE` — per-user bucketing
- `POST_IMAGE` — per-user bucketing under `recto/posts/:userId`

Deletion uses the stored `publicId` (also saved to user columns as `avatarPublicId` / `coverPublicId`).

### Affiliate Links (`AffiliateService`)

Country-aware affiliate link generation from an ISBN-13:

- **Amazon**: Converts ISBN-13 to ISBN-10 (for 978-prefix books) and builds `amazon.{domain}/dp/{isbn10}?tag={AMAZON_ASSOCIATE_TAG}`. For 979-prefix books, falls back to an Amazon search URL. Supports domains: `amazon.com`, `amazon.co.uk`, `amazon.in`, `amazon.ca`, `amazon.com.au`, `amazon.de`, `amazon.fr`.
- **AbeBooks**: `abebooks.com/servlet/SearchResults?isbn={isbn13}&cm_sp=mbc-{affiliateId}`
- **Bookshop.org**: `bookshop.org/search?keywords={isbn13}&affiliate={affiliateId}`

Country is detected via (in priority order): `?country` query param → `CF-IPCountry` Cloudflare header → `X-Vercel-IP-Country` Vercel header → `DEFAULT_COUNTRY` env var → falls back to `US`.

### SMTP / Email

`MailService` sends three email types:
1. **Welcome email** — on account creation (email + Google OAuth)
2. **OTP email** — 6-digit code for signup verification
3. **Password reset** — link containing a JWT reset token

---

## Environment Variables

| Variable                  | Required | Description                                            |
|---------------------------|----------|--------------------------------------------------------|
| `PORT`                    | No       | Listening port (default: `8080`)                       |
| `NODE_ENV`                | No       | `development` or `production`                          |
| `DATABASE_URL`            | Yes      | PostgreSQL connection string                           |
| `CLIENT_URL`              | Yes      | Frontend origin — used for CORS and OAuth redirect     |
| `REFRESH_TOKEN_SECRET`    | Yes      | JWT signing secret                                     |
| `REFRESH_TOKEN_EXPIRE`    | No       | JWT expiry string (default: `30d`)                     |
| `CLOUDINARY_CLOUD_NAME`   | Yes      | Cloudinary cloud name                                  |
| `CLOUDINARY_API_KEY`      | Yes      | Cloudinary API key                                     |
| `CLOUDINARY_API_SECRET`   | Yes      | Cloudinary API secret                                  |
| `GOOGLE_CLIENT_ID`        | Yes      | Google OAuth 2.0 client ID                             |
| `GOOGLE_CLIENT_SECRET`    | Yes      | Google OAuth 2.0 client secret                         |
| `GOOGLE_CALLBACK_URL`     | Yes      | OAuth callback URL                                     |
| `SMTP_HOST`               | Yes      | SMTP server hostname                                   |
| `SMTP_PORT`               | Yes      | SMTP port (e.g. `587`)                                 |
| `SMTP_USER`               | Yes      | SMTP username                                          |
| `SMTP_PASS`               | Yes      | SMTP password or app password                          |
| `SMTP_FROM`               | Yes      | Display name + address for outbound email              |
| `AMAZON_ASSOCIATE_TAG`    | No       | Amazon Associates tag (e.g. `recto21-21`)              |

---

## Running Locally

```bash
# From monorepo root
pnpm dev

# Or from this directory
pnpm dev   # runs: nest start --watch
```

The server runs at `http://localhost:8080`. All routes are prefixed with `/api`.

**Database migrations** (first run):

```bash
cd apps/server
pnpm dlx drizzle-kit push      # push schema directly (development)
# or
pnpm dlx drizzle-kit generate  # generate migration SQL
pnpm dlx drizzle-kit migrate   # apply migrations
```

---

## Deployment

The server is containerized via `Dockerfile` (two-stage build) and deployed to **Azure App Service** in the `centralindia` region. The public API is at `api.recto.social`.

**Build**:
```bash
docker build -t recto-server .
```

The Dockerfile:
1. **Builder stage** (`node:22-alpine`): installs pnpm, copies workspace manifests, runs `pnpm install --frozen-lockfile`, copies source, runs `pnpm --filter @recto/server build`
2. **Runner stage** (`node:22-alpine`): copies compiled output from builder, exposes port `8080`, starts with `node /app/apps/server/dist/main.js`

Rate limiting applied at bootstrap:
- `/api/auth/**`: 30 requests / 15 minutes
- `/api/**`: 300 requests / 15 minutes
