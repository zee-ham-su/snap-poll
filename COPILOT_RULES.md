# Snap Poll — Project AI Rules

These rules help AI assistants scaffold, refactor, and extend this Next.js + Supabase polling app consistently.

## Context and stack
- Framework: Next.js App Router (app/), TypeScript, React 19.
- UI: shadcn/ui primitives in `components/ui` (Button, Input, etc.).
- Auth & DB: Supabase (`lib/supabase.ts`, `lib/supabaseClient.ts`, `lib/supabase-server.ts`).
- Auth state: `contexts/auth-context.tsx` (provider wrapped in `app/layout.tsx`).
- Paths alias: `@/*` → repo root.

## Source layout (follow this)
- Pages and routes:
  - Client pages in `app/**/page.tsx`.
  - API/Route handlers in `app/api/**/route.ts` (server-only code).
  - Auth pages split: `app/auth/login/page.tsx`, `app/auth/register/page.tsx`.
- Components:
  - Feature components in `components/` (e.g., `poll-view.tsx`, `poll-results.tsx`).
  - Reusable UI primitives in `components/ui/`.
  - For new forms, prefer `components/<Feature>Form.tsx` and import into a page.
- Supabase:
  - Browser/client: `getSupabaseClient()` from `lib/supabaseClient.ts`.
  - Server: `supabaseServer` from `lib/supabase-server.ts` (server-only).

## Supabase conventions
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` → browser-safe.
  - `SUPABASE_SERVICE_ROLE_KEY` → server-only. Never expose or prefix with `NEXT_PUBLIC`.
- Client auth:
  - Sign-in/up in client components using `getSupabaseClient().auth.*`.
  - Use `useAuth()` from `contexts/auth-context.tsx` for session, redirects, and sign-out.
- Server access:
  - Use `supabaseServer` in route handlers and server actions (no secrets in responses).
  - Validate input server-side even if already validated client-side.

## UI and form rules
- Prefer shadcn/ui primitives from `components/ui` for inputs/buttons.
- Keep forms minimal and accessible: labels linked by `htmlFor`, proper types, and `aria-*` when needed.
- Validation: basic client-side checks (email format, required fields, length). Mirror critical validation on server.
- TypeScript: avoid `any`. Type event handlers and responses. Bubble user-facing errors as strings.
- Consistency: If a similar component exists (e.g., `components/create-poll-form.tsx`), reuse or extend it; avoid duplicates.

## Routing & data rules
- Redirect signed-in users away from auth pages; redirect signed-out users from protected pages to `/auth/login`.
- API/route handlers return `NextResponse.json({ ... }, { status })` and never include secrets.
- For data fetching in pages, prefer server components or route handlers; avoid heavy client-side fetching unless real-time is required.
- Real-time UI should subscribe client-side only (avoid leaking server keys).

## Code style and quality gates
- TypeScript strict: no `any`; prefer explicit types.
- Keep components functional; mark client components with `"use client"` at top when needed.
- Lint/typecheck/build before done: `npm run build`.
- Tests (if/when added): cover happy path + 1–2 edge cases (empty, invalid input, auth states).

## Example task: “Create a form to submit a new poll”
- Do:
  1) Check for existing forms. We have `components/create-poll-form.tsx`. Reuse it instead of creating a new one.
  2) If a new route is needed, add or use `app/create/page.tsx` and render the form.
  3) Use shadcn/ui `Input`, `Textarea`, `Button`. Add basic validation (required, min length).
  4) On submit, call a server action or `app/api` route that uses `supabaseServer` to insert the poll. Return safe data only.
  5) On success, route to the new poll page `/poll/[id]`.
- Don’t:
  - Don’t call `supabaseServer` from the client.
  - Don’t expose `SUPABASE_SERVICE_ROLE_KEY` or return it from any API.
  - Don’t duplicate existing components without a reason.

Minimal contract for new server handlers
- Input: JSON with validated fields (e.g., `{ title: string; options: string[] }`).
- Output: `{ id: string }` on success; `{ error: string }` with proper status on failure.
- Errors: 400 (validation), 401 (auth), 403 (forbidden), 500 (unexpected).

## When using the AI
- Reference these rules before scaffolding. If the repo already has a component for a feature, prefer reuse.
- Follow the Supabase split (client vs server) and env var rules.
- Keep changes minimal and targeted; don’t reformat unrelated files.
- After edits, run `npm run build` to catch type/lint errors. Fix them before finishing.

## Observation log (keep updating)
- 2025-08-28: Split auth routes were added; AI should redirect `/auth` → `/auth/login`. ESLint flagged `any` in forms; explicit error handling preferred.
- Update this log with new patterns and exceptions as the app evolves.
