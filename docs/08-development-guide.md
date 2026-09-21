# 08 — Development Guide

## Prerequisites

- **Node.js** — 25.8.0 is what's in use locally. Next.js 16 requires Node 20.9+.
- **pnpm** — 10.22.0. The repo has a `pnpm-lock.yaml` and a `pnpm-workspace.yaml`;
  use pnpm, not npm or yarn, or you'll generate a competing lockfile.

## Getting started

```bash
git clone <repo> && cd stuhdee
pnpm install
pnpm dev            # http://localhost:3000
```

Right now that serves the `create-next-app` starter page — see
[07 — Implementation Status](./07-implementation-status.md).

## Scripts

| Command | Does |
| --- | --- |
| `pnpm dev` | Dev server with HMR on :3000 |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build (run `build` first) |
| `pnpm lint` | ESLint over the current directory |

There is no `typecheck` script. Worth adding, since `pnpm lint` won't catch type
errors:

```jsonc
"typecheck": "tsc --noEmit"
```

## Environment variables — *Proposed*

No `.env.example` exists yet. `.gitignore` covers `.env*`, so real secrets stay
out of git — but that also means **`.env.example` itself is ignored** and must be
force-added when you create it:

```bash
git add -f .env.example
```

Based on the integrations the structure references:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only — never NEXT_PUBLIC_

# Stripe
STRIPE_SECRET_KEY=                # server only
STRIPE_WEBHOOK_SECRET=            # server only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Firebase Cloud Messaging
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
FIREBASE_SERVICE_ACCOUNT_KEY=     # server only, for sending push

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### The `NEXT_PUBLIC_` rule

Anything prefixed `NEXT_PUBLIC_` is **inlined into the JavaScript bundle and
visible to every visitor**. The three service-role/secret keys above must never
carry that prefix. The Supabase *anon* key is designed to be public — it's safe
only because RLS policies constrain it, which is another reason the policies in
[05 — Data Model](./05-data-model.md) are the real security boundary.

## Local Supabase — *Proposed*

The `supabase/migrations/` layout matches the Supabase CLI's convention:

```bash
pnpm dlx supabase init          # if supabase/config.toml is missing
pnpm dlx supabase start         # local Postgres + Auth + Studio in Docker
pnpm dlx supabase db reset      # apply migrations + seed.sql
pnpm dlx supabase migration new <name>
pnpm dlx supabase gen types typescript --local > src/types/database.ts
```

Regenerate `src/types/database.ts` after every migration. It's build output —
don't hand-edit it.

## Testing Stripe webhooks locally

The webhook endpoint can't be reached from Stripe's servers on localhost. Use the
CLI to forward:

```bash
stripe listen --forward-to localhost:3000/api/notifications/webhooks/stripe
```

It prints a signing secret — put that in `STRIPE_WEBHOOK_SECRET` for local dev.
It is different from the production secret.

## Conventions

### Where code goes
See [03 — Architecture](./03-architecture.md). The short version:

- Business rules → `features/<domain>/services/`
- Client state → `features/<domain>/hooks/`
- Third-party SDK wiring → `lib/<service>/`
- Presentational React → `components/`
- Routing and nothing else → `app/`

If you're about to write a database query inside a component, it belongs in a
service instead.

### Imports
Use the `@/` alias, not relative traversal:

```ts
import { courseService } from "@/features/courses/services/course.service";  // yes
import { courseService } from "../../../features/courses/services/course.service";  // no
```

### Server vs. client components
App Router components are server components by default. Add `"use client"` only
when you need state, effects, or event handlers — and push it as far down the tree
as you can. A `"use client"` on a layout opts its whole subtree into the client
bundle.

### Styling
Tailwind v4, configured in CSS. New design tokens go in the `@theme inline` block
in `src/app/globals.css` — there is no `tailwind.config.js` and adding one would
fight the v4 setup.

### Naming
`kebab-case` files, `<domain>.service.ts` services, `use<Thing>.ts` hooks,
`route.ts` for handlers. See [04](./04-project-structure.md).

## Git

Branches: `main` and `dev` on the remote, with `main` as default.

The single commit `4120cf7 "stuhdee structure"` established the scaffold. There's
no CI config, no PR template, and no commit message convention in evidence yet —
all still open.

## Before you commit

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Since `strict: true` is on and `pnpm lint` doesn't typecheck, the middle command
is the one that catches most mistakes.
