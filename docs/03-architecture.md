# 03 — Architecture

The scaffold encodes a **feature-sliced architecture** layered on top of the
Next.js App Router. Nothing is implemented yet, but the folder layout states the
rules clearly enough to document them — and following them consistently is what
will keep the codebase navigable.

## The five layers

```
  app/            Routing, pages, route handlers.  Thin.
     │
     ▼
  features/       Domain logic: hooks + services + types, one folder per domain.
     │
     ▼
  lib/            Third-party clients and shared utilities.  No domain logic.
     │
     ▼
  components/     Presentational React.  Reads props, renders markup.
     │
  types/          Cross-cutting types shared by everything above.
```

### `src/app/` — routing only
Pages and route handlers. A page's job is to resolve params, call into a feature
service or hook, and render components. Business rules do not belong here.

Two route groups organise the app without adding URL segments:

- `(auth)` — login and signup, with their own minimal layout (no nav/sidebar).
- `(dashboard)` — the authenticated app, with nav and sidebar chrome.

### `src/features/` — the domain layer
Five domains: `auth`, `courses`, `sessions`, `notifications`, `payments`. Each
follows the same internal shape:

```
features/<domain>/
├── types.ts            Domain types
├── hooks/              Client-side React state (use<Thing>.ts)
└── services/           Data access and business rules (<thing>.service.ts)
```

The split that matters: **services are callable from anywhere** (route handlers,
server components, other services); **hooks are client-only** and generally wrap a
service call in React state. Keeping rules in services is what makes them reusable
from a route handler rather than trapped in a component.

`notifications` and `payments` have services but no `hooks/` folder except
`payments/hooks/useSubscription.ts` — consistent with notifications being driven by
the server and a scheduler rather than by UI state.

### `src/lib/` — integrations and utilities
One folder per external service (`supabase/`, `stripe/`, `firebase/`), plus
`utils.ts` and `constants.ts`. This layer knows how to *talk to* a service; it
does not know what a "course" or a "streak" is. Domain meaning lives one layer up
in `features/`.

### `src/components/` — presentational React
Grouped by area: `ui/` (generic primitives — button, card, input, modal), plus
`auth/`, `layout/`, `dashboard/`, and `courses/` for domain-flavoured components.
Components should take props and render; fetching belongs in a page or a hook.

### `src/types/` — shared contracts
`database.ts` (intended for Supabase-generated row types), `api.ts` (request and
response shapes), and `index.ts` (re-export barrel).

## Request flow — *Proposed*

How a typical authenticated read is expected to work:

```
Browser
  │
  ▼
src/middleware.ts ──── refreshes the Supabase session cookie,
  │                    redirects unauthenticated users away from (dashboard)
  ▼
app/(dashboard)/courses/page.tsx      ← server component
  │
  ▼
features/courses/services/course.service.ts
  │
  ▼
lib/supabase/server.ts ──── cookie-scoped Supabase client
  │
  ▼
Postgres (RLS enforces per-user isolation)
```

And a mutation from the client:

```
components/courses/course-form.tsx
  │  (client component)
  ▼
features/courses/hooks/useCourses.ts
  │
  ▼
fetch → app/api/courses/route.ts      ← route handler
  │
  ▼
features/courses/services/course.service.ts → lib/supabase/server.ts → Postgres
```

Note that the same service is the single entry point in both directions. That is
the main payoff of the layering.

## Auth boundary — *Proposed*

Three layers of protection, each doing a different job:

1. **`src/middleware.ts`** — runs on every matching request, refreshes the auth
   cookie, and bounces unauthenticated users out of `(dashboard)` routes. This is
   the cheap, coarse gate.
2. **`components/auth/auth-guard.tsx`** — client-side guard for conditional UI.
   Convenience, not security.
3. **Postgres Row Level Security** — the real boundary. Every table carries a
   `user_id` and RLS policies scope reads and writes to `auth.uid()`. This is the
   layer that must be correct; the other two are UX.

## Cross-cutting concerns

**Webhooks.** `api/notifications/webhooks/stripe/route.ts` sits under
`notifications/`, which is an odd home for a *payments* webhook. Either the path
is a mistake or the intent is that Stripe events fan out into user notifications.
Worth resolving deliberately — see [07](./07-implementation-status.md).

**Scheduling.** `notifications/services/scheduler.service.ts` implies something
must fire reminders on a timer. Next.js route handlers are request-driven and
cannot do this alone; the app will need an external trigger — a cron job hitting
an endpoint, a Supabase scheduled function, or a queue. This is an unresolved
design question, not something the scaffold answers.
