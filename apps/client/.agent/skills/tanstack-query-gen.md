---
description: TanStack Query Generation Workflow
---

# Skill: TanStack Query Generation (`tanstack-query-gen`)

This is the strict execution manual for implementing TanStack (React) Query in the `recto-client` Next.js application. You **MUST** execute this exact checklist sequentially.

**Golden Rule:** TanStack Query is strictly FORBIDDEN for initial page loads.

## 1. Use Case Verification (Hard Stop)

Before writing any TanStack Query code, verify its necessity.

- [ ] **Is this data needed for the initial page load or SEO?** If yes, **STOP**. Fetch it securely inside a React Server Component.
- [ ] **Valid Use Cases Only:** Proceed only if this is for:
  - Infinite scrolling feeds.
  - Periodic polling or background syncing.
  - Highly optimistic, low-latency UI mutations (e.g., liking a book, adding a comment).

## 2. Optimistic UI Updates

For interactive mutations, you must provide a zero-latency UX.

- [ ] Utilize `onMutate` inside `useMutation`.
- [ ] Save the previous query state (`queryClient.getQueryData`).
- [ ] Synchronously update the cache with the optimistic new value (`queryClient.setQueryData`).
- [ ] **Rollback Logic:** Provide explicit rollback logic in the `onError` callback using the saved previous state (`queryClient.setQueryData(key, context.previousData)`).
- [ ] Always trigger `onSettled` to invalidate the query and forcefully refetch the absolute truth from the server.

## 3. Query Key Factory

You must maintain a strict, centralized array-based pattern for Query Keys to prevent cache collisions and typos across the application.

- [ ] Define query keys as constant arrays (e.g., `['features', 'books', 'feed', { category: 'fiction' }]`).
- [ ] Ensure query keys are exported and reused logically; never hardcode ad-hoc string keys directly inside the `useQuery` call.

## 4. Separation of Concerns (Custom Hooks)

- [ ] **Encapsulation:** Do not write raw `useQuery`, `useInfiniteQuery`, or `useMutation` hooks directly inside UI components.
- [ ] Abstract the TanStack Query logic into custom hooks strictly within the feature directory (e.g., `src/features/feed/hooks/useBookFeed.ts`).
- [ ] The UI component should simply call `const { data, isLoading } = useBookFeed();` and remain agnostic to the caching implementation.
