---
description: Form & Server Action Generation Workflow
---

# Skill: Form & Server Action Generation (`form-action-gen`)

This is the strict execution manual for building forms, data mutations, and Next.js Server Actions in the `recto-client` Next.js application. You **MUST** execute this exact checklist sequentially to ensure end-to-end type safety and secure mutations.

## 1. Stack Mandate

- [ ] You are strictly mandated to use **`react-hook-form`** for client-side form state management.
- [ ] You are strictly mandated to use **`zod`** and `@hookform/resolvers/zod` for validation.
- [ ] Do not use raw controlled inputs (`value` + `onChange` with `useState`) for complex forms.

## 2. Schema Isolation

- [ ] **Strict Boundary:** Zod schemas MUST be defined outside the component body.
- [ ] Place the schema at the top of the file, or ideally, in a shared `types/` or `schemas/` directory if the Server Action lives in a different file. Both the Client Form and the Server Action **must** import and use the exact same Zod schema.

## 3. Server Action Boundary (`"use server"`)

- [ ] Ensure the Server Action file or function explicitly declares `"use server"` at the very top.
- [ ] **Input Parsing:** The Server Action MUST parse the incoming `FormData` or payload against the isolated Zod schema using `schema.safeParse(data)`.
- [ ] **Validation Rejection:** If `safeParse` fails, the Server Action must immediately return the validation errors to the client. It must never proceed to make a network request to the NestJS backend with invalid data.

## 4. Error Handling & Form State

- [ ] The form UI must explicitly handle and display field-level validation errors returned by `react-hook-form`.
- [ ] The form UI must visually indicate pending/submitting states using RHF's `isSubmitting` or Next.js `useFormStatus` to disable the submit button and prevent double submissions.
- [ ] The form must gracefully handle and display global submission errors (e.g., "Network Error" or "Email already in use") returned by the Server Action.

## 5. Cache Invalidation

- [ ] **Data Sync:** Upon a successful mutation and response from the NestJS backend, the Server Action **MUST** trigger Next.js cache invalidation before returning success to the client.
- [ ] Use `revalidatePath('/path/to/update')` or `revalidateTag('tag-name')` to ensure the surrounding Server Components immediately reflect the updated state.
