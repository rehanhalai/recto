---
name: recto-project-structure
description: "Enforce canonical Recto monorepo structure. Use when: scaffolding new features, deciding where files belong, checking module organization, or flagging structural anti-patterns. Guides Next.js App Router (client), NestJS (server), TanStack Query patterns, Drizzle schema conventions, and naming standards."
---

# Recto Project Structure

Recto is a social reading platform built as a **Turborepo monorepo** with pnpm workspaces.

## Stack Summary

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Client | Next.js (App Router), TanStack Query, Tailwind CSS, shadcn/ui, Phosphor Icons, Cloudinary |
| Server | NestJS, Drizzle ORM, PostgreSQL (Neon serverless) |
| Shared Types | `packages/types` (inferred from Drizzle schema) |
| Auth | Google OAuth + JWT/session dual-layer (httpOnly cookies) |
| Media | Cloudinary |
| Book Data | Google Books API (primary), Open Library (fallback) |

---

## Canonical Directory Tree

```
recto/
├── apps/
│   ├── client/                          # Next.js 16 App Router
│   │   ├── src/
│   │   │   ├── app/                     # App Router root
│   │   │   │   ├── (app)/               # Auth-required routes
│   │   │   │   │   ├── (feed)/
│   │   │   │   │   ├── (home)/
│   │   │   │   │   ├── (profile)/
│   │   │   │   │   │   ├── [username]/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── profile/
│   │   │   │   │   ├── (search)/
│   │   │   │   │   └── (sidebar)/
│   │   │   │   ├── (auth)/              # Auth routes (signup, login)
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── signup/
│   │   │   │   │   ├── forgot-password/
│   │   │   │   │   ├── reset-password/
│   │   │   │   │   └── google-callback/
│   │   │   │   ├── landing/             # Public landing
│   │   │   │   ├── layout.tsx           # Root layout (Providers, fonts, metadata)
│   │   │   │   ├── page.tsx             # / → redirect to /feed or /landing
│   │   │   │   └── globals.css
│   │   │   ├── components/
│   │   │   │   ├── ui/                  # shadcn components (primitives only)
│   │   │   │   ├── layout/              # StandardLayout, Header, Footer
│   │   │   │   ├── providers/           # Query, Theme, Auth providers
│   │   │   │   └── *.tsx                # Shared UI (Avatar, Badge, etc.)
│   │   │   ├── features/                # Feature-scoped modules
│   │   │   │   ├── auth/
│   │   │   │   │   ├── hooks/           # useAuth, useLogout, etc.
│   │   │   │   │   ├── store/           # Zustand auth store
│   │   │   │   │   ├── components/      # LoginForm, SignupForm, etc.
│   │   │   │   │   └── api.ts           # Auth API calls (if separate)
│   │   │   │   ├── book/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/           # useBookSearch, useBookDetail
│   │   │   │   │   └── query-keys.ts    # bookKeys factory
│   │   │   │   ├── feed/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   └── query-keys.ts
│   │   │   │   ├── list/
│   │   │   │   ├── posts/
│   │   │   │   ├── notifications/
│   │   │   │   ├── profile/
│   │   │   │   ├── search/
│   │   │   │   ├── sidebar/
│   │   │   │   └── home/
│   │   │   ├── lib/
│   │   │   │   ├── api.ts               # Shared apiInstance with auth interceptor
│   │   │   │   ├── utils.ts
│   │   │   │   ├── cookies.ts
│   │   │   │   ├── toast.ts
│   │   │   │   └── ...
│   │   │   ├── hooks/
│   │   │   │   ├── use-media-query.ts
│   │   │   │   └── ...                  # General-purpose hooks
│   │   │   ├── store/
│   │   │   │   └── auth.store.ts        # Zustand auth store
│   │   │   ├── constants/
│   │   │   │   └── genres.ts
│   │   │   ├── provider.tsx             # Root providers wrapper
│   │   │   └── config.ts                # Client-side config
│   │   ├── public/
│   │   │   ├── sw.js                    # Service Worker
│   │   │   ├── offline.html
│   │   │   ├── favicon/
│   │   │   └── frames/
│   │   ├── next.config.ts
│   │   ├── components.json              # shadcn config
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── server/                          # NestJS
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts            # Root module (imports all feature modules)
│       │   ├── app.controller.ts
│       │   ├── app.service.ts
│       │   ├── features/                # Feature-based modules
│       │   │   ├── auth/
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.repository.ts
│       │   │   │   ├── dto/             # Data transfer objects (request/response)
│       │   │   │   │   ├── login.dto.ts
│       │   │   │   │   ├── register.dto.ts
│       │   │   │   │   └── ...
│       │   │   │   └── strategies/      # Passport strategies (JWT, OAuth)
│       │   │   ├── users/
│       │   │   │   ├── users.module.ts
│       │   │   │   ├── users.controller.ts
│       │   │   │   ├── users.service.ts
│       │   │   │   ├── users.repository.ts
│       │   │   │   └── dto/
│       │   │   ├── books/
│       │   │   ├── lists/
│       │   │   ├── posts/
│       │   │   ├── tracking/ (or reading-tracker)
│       │   │   ├── notifications/
│       │   │   ├── search/
│       │   │   └── (other features)
│       │   ├── common/                   # Shared infrastructure
│       │   │   ├── guards/              # JwtGuard, RolesGuard
│       │   │   ├── decorators/          # @Auth, @CurrentUser
│       │   │   ├── interceptors/        # PaginationInterceptor, etc.
│       │   │   ├── pipes/               # ValidationPipe
│       │   │   ├── filters/             # ExceptionFilter
│       │   │   ├── middleware/          # Auth middleware
│       │   │   ├── clients/             # External API clients (GoogleBooks, OpenLibrary)
│       │   │   └── utils/               # Shared utilities
│       │   ├── config/
│       │   │   └── config.ts            # Environment config with Joi validation
│       │   ├── constants/
│       │   ├── db/
│       │   │   ├── db.module.ts         # Database setup (Drizzle, connection)
│       │   │   ├── schema/
│       │   │   │   ├── users.ts         # User entity schema
│       │   │   │   ├── books.ts         # Book entity schema
│       │   │   │   ├── lists.ts
│       │   │   │   ├── posts.ts
│       │   │   │   ├── content.ts       # Content (interactions, comments)
│       │   │   │   ├── interactions.ts  # Likes, follows, etc.
│       │   │   │   ├── index.ts         # Re-export all schemas
│       │   │   │   └── migrations/      # SQL migrations
│       │   │   └── migrations/
│       │   └── (other modules)
│       ├── test/
│       ├── drizzle.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── types/                           # Shared types package
│   │   ├── src/
│   │   │   ├── index.ts                 # Main export
│   │   │   ├── user.types.ts            # Inferred from Drizzle user schema
│   │   │   ├── book.types.ts            # Inferred from Drizzle book schema
│   │   │   ├── post.types.ts
│   │   │   ├── list.types.ts
│   │   │   ├── interactions.types.ts
│   │   │   ├── content.types.ts
│   │   │   ├── common.types.ts          # Pagination, responses, etc.
│   │   │   └── (other types)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── assets/                          # Shared assets (fonts, icons, images)
│       ├── src/
│       │   ├── fonts/
│       │   ├── images/
│       │   └── logos/
│       └── package.json
│
├── .agent/                              # Agent customization (skills, instructions)
├── .github/                             # Workspace config (workflows, templates)
├── turbo.json                           # Turborepo config
├── pnpm-workspace.yaml                  # pnpm monorepo config
├── package.json                         # Root package
└── README.md
```

---

## Server (NestJS) Structure Rules

### Feature Module Organization

Each feature has this layout:

```
features/
└── users/
    ├── users.module.ts          # Module definition (imports/exports)
    ├── users.controller.ts      # HTTP endpoints
    ├── users.service.ts         # Business logic
    ├── users.repository.ts      # Database queries
    ├── dto/
    │   ├── create-user.dto.ts
    │   ├── update-user.dto.ts
    │   └── user-response.dto.ts
    └── entities/                # (Optional) Drizzle-inferred interfaces
        └── user.entity.ts
```

### Rules

1. **No business logic in controllers** — Controllers receive requests, validate DTOs, call service.
2. **Service orchestrates** — Calls repository for data, applies business rules, returns DTOs.
3. **Repository encapsulates Drizzle** — All `db.query.*` calls happen here; service doesn't know SQL.
4. **DTOs for all endpoints** — Input validation via `@nestjs/class-validator`, output DTOs for type safety.
5. **Shared code in `common/`** — Guards (JwtGuard, RolesGuard), decorators (@CurrentUser), interceptors.
6. **One schema file per entity** — `apps/server/db/schema/users.ts`, `apps/server/db/schema/books.ts`, etc.
7. **Schema composition in `schema/index.ts`** — Re-export all for Drizzle migrations and introspection.

---

## Client (Next.js App Router) Structure Rules

### Route Conventions

- Use grouped routes `(groupName)` for logical page organization (e.g., `(app)`, `(auth)`, `(landing)`).
- Dynamic routes via `[param]` folders; params are async Promises: `params: Promise<{ id: string }>`.
- Server Components by default; `'use client'` only for interactivity (state, hooks, event handlers).

### Feature Modules

Organize large features under `features/<featureName>/`:

```
features/book/
├── components/
│   ├── BookCard.tsx
│   ├── BookDetail.tsx
│   └── book-strips/
│       └── BookCarousel.tsx
├── hooks/
│   ├── use-book-search.ts
│   ├── use-book-detail.ts
├── query-keys.ts         # React Query key factory
└── api.ts               # (Optional) Feature-scoped API calls
```

### Rules

1. **Colocate related code** — Hooks, query keys, and components for a feature live together.
2. **Query key factories** — Define `bookKeys = { all: [...], list: (...) => [...], detail: (id) => [...] }` in `query-keys.ts`.
3. **Single `apiInstance`** — All API calls go through `lib/api.ts` with auth interceptor; no direct `fetch()`.
4. **Folder naming** — Components are PascalCase files; hooks are `use-camelCase.ts`.
5. **No global component dump** — `components/` is for shared UI (Avatar, Badge); feature UI lives in `features/`.
6. **Reuse shadcn primitives** — Button, Card, Dialog from shadcn; don't override brand tokens.

---

## TanStack Query Patterns

### Setup

```ts
// lib/api.ts
const apiInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

apiInstance.interceptors.request.use(async (config) => {
  const token = await getToken(); // from auth store or cookies
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const queryClient = new QueryClient({ defaultOptions: { ... } });
```

### Query Key Factories

```ts
// features/book/query-keys.ts
export const bookKeys = {
  all: ["books"] as const,
  list: (params: BookListParams) =>
    [...bookKeys.all, "list", params] as const,
  detail: (id: string) =>
    [...bookKeys.all, "detail", id] as const,
};
```

### Queries

```ts
// features/book/hooks/use-book-search.ts
import { bookKeys } from '../query-keys';

export function useBookSearch(query: string) {
  return useQuery({
    queryKey: bookKeys.list({ query }),
    queryFn: async () => {
      const { data } = await apiInstance.get('/books/search', { params: { query } });
      return data;
    },
  });
}
```

### Mutations with Optimistic Updates

```ts
export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiInstance.post('/lists', payload);
      return data;
    },
    onMutate: async (newList) => {
      // Optimistically update the cache
      await queryClient.cancelQueries({ queryKey: listKeys.all });
      const prev = queryClient.getQueryData(listKeys.all);
      queryClient.setQueryData(listKeys.all, (old) => [...old, newList]);
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(listKeys.all, context.prev);
    },
  });
}
```

### Rules

1. **Avoid `invalidateQueries` for UX** — Prefer optimistic updates or setQueryData for responsiveness.
2. **Centralize query keys** — Define in `query-keys.ts` per feature; don't hardcode strings.
3. **Auth via interceptor** — Don't pass token to every query; handle in request interceptor.
4. **Error handling** — Let mutations report errors; query errors trigger Suspense boundaries or error states.

---

## Drizzle Schema Conventions

### One File Per Domain Entity

```ts
// apps/server/db/schema/users.ts
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Composition in Index

```ts
// apps/server/db/schema/index.ts
export * from './users';
export * from './books';
export * from './posts';
// ... all schemas
```

### Export Types to `packages/types`

```ts
// packages/types/src/user.types.ts
export type { User, NewUser } from '@recto/server/db/schema';

// Re-export from packages/types/src/index.ts
export type { User, NewUser } from './user.types';
```

### Rules

1. **Infer types from schema** — Use `InferSelectModel`, `InferInsertModel` for compile-time type safety.
2. **One file per entity** — Not one file with all schemas; keeps concerns separate.
3. **Publish types to packages/types** — Client and server both import from the shared package.
4. **Migrations in `db/migrations/`** — Auto-generated by Drizzle; commit to git.

---

## Naming Conventions

| Category | Rule | Example |
|----------|------|---------|
| Files (general) | kebab-case | `use-book-search.ts`, `user-profile-page.tsx` |
| Components | PascalCase | `BookCard.tsx`, `UserAvatar.tsx` |
| Hooks | useCamelCase | `useBookSearch`, `useAuth` |
| Query keys | camelCase object | `bookKeys`, `userKeys` |
| Folders | lowercase or kebab-case | `features/book`, `common/guards` |
| Database tables | snake_case | `users`, `book_lists`, `created_at` |
| Environment vars | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_API_URL`, `DATABASE_URL` |

---

## Anti-Patterns to Avoid

### Server (NestJS)

❌ **Business logic in controller**
```ts
@Post('/lists')
create(@Body() dto: CreateListDto) {
  return db.query.lists.create(dto); // WRONG: No service layer
}
```

✅ **Service handles logic**
```ts
@Post('/lists')
create(@Body() dto: CreateListDto) {
  return this.listService.create(dto);
}

// lists.service.ts
create(dto: CreateListDto) {
  // Apply rules, call repository
  return this.listRepository.create(dto);
}
```

❌ **Direct Drizzle queries in service**
```ts
// service
this.db.query.users.findFirst({ where: eq(users.id, id) });
```

✅ **Repository encapsulates queries**
```ts
// repository
findById(id: number) {
  return this.db.query.users.findFirst({ where: eq(users.id, id) });
}
```

### Client (Next.js)

❌ **Direct `fetch()` in components**
```tsx
useEffect(() => {
  fetch('/api/books/search?q=' + query).then(...);
}, [query]);
```

✅ **Use custom hook with apiInstance**
```tsx
export function useBookSearch(query: string) {
  return useQuery({
    queryKey: bookKeys.list({ query }),
    queryFn: () => apiInstance.get('/books/search', { params: { query } }),
  });
}
```

❌ **Async Server Component without awaiting params**
```tsx
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>; // WRONG: params is Promise in Next 16
}
```

✅ **Await async params in Server Component**
```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>{id}</div>;
}
```

❌ **Barrel exports everywhere**
```ts
// components/index.ts
export { default as Button } from './Button';
export { default as Card } from './Card';
// ... 50 more

// usage: import { Button, Card } from '@/components'; (bundles everything)
```

✅ **Direct imports**
```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

❌ **Caching any GET endpoint without discrimination**
```ts
// sw.js
if (event.request.method === 'GET') {
  // Cache API responses, migrations, everything
}
```

✅ **Cache only static assets**
```ts
const isStaticAsset = ['style', 'script', 'image', 'font'].includes(
  event.request.destination,
);
if (isStaticAsset) { ... }
```

---

## Scaffolding a New Feature

### Server (NestJS)

```bash
# 1. Create module structure
mkdir -p apps/server/src/features/newfeature/{dto,entities}

# 2. Create files
cat > apps/server/src/features/newfeature/newfeature.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { NewfeatureController } from './newfeature.controller';
import { NewfeatureService } from './newfeature.service';

@Module({
  controllers: [NewfeatureController],
  providers: [NewfeatureService],
})
export class NewfeatureModule {}
EOF

# 3. Create service
cat > apps/server/src/features/newfeature/newfeature.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class NewfeatureService {
  // TODO: implement
}
EOF

# 4. Create controller
cat > apps/server/src/features/newfeature/newfeature.controller.ts << 'EOF'
import { Controller } from '@nestjs/common';
import { NewfeatureService } from './newfeature.service';

@Controller('newfeature')
export class NewfeatureController {
  constructor(private readonly service: NewfeatureService) {}
  // TODO: add endpoints
}
EOF

# 5. Import module in app.module.ts
```

### Client (Next.js)

```bash
# 1. Create feature folder
mkdir -p apps/client/src/features/newfeature/{components,hooks}

# 2. Create query keys
cat > apps/client/src/features/newfeature/query-keys.ts << 'EOF'
export const newfeatureKeys = {
  all: ['newfeature'] as const,
  list: (params: any) => [...newfeatureKeys.all, 'list', params] as const,
  detail: (id: string) => [...newfeatureKeys.all, 'detail', id] as const,
};
EOF

# 3. Create hook
cat > apps/client/src/features/newfeature/hooks/use-newfeature.ts << 'EOF'
import { useQuery } from '@tanstack/react-query';
import { apiInstance } from '@/lib/api';
import { newfeatureKeys } from '../query-keys';

export function useNewfeature() {
  return useQuery({
    queryKey: newfeatureKeys.all,
    queryFn: async () => {
      const { data } = await apiInstance.get('/newfeature');
      return data;
    },
  });
}
EOF

# 4. Create component
cat > apps/client/src/features/newfeature/components/NewfeatureCard.tsx << 'EOF'
'use client';

export function NewfeatureCard() {
  // TODO: implement
  return <div></div>;
}
EOF
```

---

## Quick Decisions

| Question | Answer |
|----------|--------|
| Where does a new hook go? | `features/<feature>/hooks/use-feature.ts` or `hooks/use-generic.ts` if truly generic |
| Where do custom API calls go? | `features/<feature>/api.ts` or use `useQuery`/`useMutation` with `apiInstance` directly |
| Should I create a new feature folder? | Yes, if it has >1 component/hook or domain-specific data fetching |
| Where does shared UI go? | `components/` for primitives (Button, Badge); `features/` for scoped UI |
| Do I export from `components/index.ts`? | No; import directly: `from '@/components/ui/button'` |
| How do I share types across apps? | Define/infer in `packages/types`, re-export from `packages/types/src/index.ts` |
| Where do I put utility functions? | `lib/utils.ts` for app-wide; `features/<feature>/utils.ts` for feature-specific |
| Should the Server Component fetch data? | Yes; fetch during render, pass data as props to Client Components |

---

## Related Customizations to Create Next

1. **Auth flow skill** — Session management, JWT refresh, OAuth callback handling.
2. **Drizzle schema skill** — Migration patterns, relation definitions, constraints.
3. **TanStack Query advanced patterns** — Prefetching, dependent queries, infinite queries.
4. **Next.js 16 specific patterns** — Server Components, async params, Image optimization.
5. **Testing in Recto** — Jest setup, mocking apiInstance, testing NestJS services.
