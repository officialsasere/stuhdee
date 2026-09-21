# 07 — Implementation Status

Accurate as of commit `4120cf7 "stuhdee structure"` (the only commit on `main`).

## Summary

| | Count |
| --- | --- |
| Files under `src/` and `supabase/` | 61 |
| Files with real content | 3 |
| Placeholder stubs | 4 |
| Empty (0 bytes) | 54 |

**Nothing in the product is implemented.** `pnpm dev` serves the unmodified
`create-next-app` starter page. Every route under `(auth)`, `(dashboard)`, and
`api/` is an empty file, which means those URLs do not resolve.

## What actually works

| File | State |
| --- | --- |
| `src/app/layout.tsx` | Root layout. Loads Geist Sans/Mono, sets default metadata (still "Create Next App"). |
| `src/app/page.tsx` | Starter landing page — Next.js logo and template links. |
| `src/app/globals.css` | Tailwind v4 import, CSS theme tokens, dark-mode media query. |
| Config files | `tsconfig`, `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts` all valid. |

`src/components/ui/{button,card,input,modal}.tsx` contain generated stubs that
render their own name as text (`<div>button</div>`) and export a lowercase
component. They are not usable and will need rewriting rather than extending.

## Known issues in the scaffold

These are real problems in the committed structure, worth fixing before building
on top of them.

### 1. `api/courses/routes.ts` is misnamed — blocking
Next.js only recognises `route.ts`. The file as named is never routed, so
`/api/courses` will 404 no matter what you put in it.

```bash
git mv src/app/api/courses/routes.ts src/app/api/courses/route.ts
```

### 2. No layout for the `(dashboard)` group — blocking
`src/components/layout/{nav,sidebar,footer}.tsx` exist, but `(dashboard)/` has no
`layout.tsx` to mount them in. Every dashboard page would have to import the
chrome itself, which defeats the point of the route group.

Add `src/app/(dashboard)/layout.tsx`.

### 3. `settings/page.tsx` is outside the route groups
It sits at `src/app/settings/page.tsx`, so it resolves to `/settings` but inherits
only the root layout — no nav, no sidebar, and no protection from the dashboard
layout's auth check. It almost certainly belongs at
`src/app/(dashboard)/settings/page.tsx`.

### 4. The Stripe webhook is filed under `notifications/`
`api/notifications/webhooks/stripe/route.ts` is a **payments** concern living in
the notifications tree. Either move it to `api/webhooks/stripe/route.ts` (the
conventional spot, and it keeps webhook auth rules in one place) or write down why
it lives there. Note the path is cosmetic — it does not affect behaviour — but it
will mislead the next person reading the tree.

### 5. Body font overrides the loaded fonts
`globals.css` sets `body { font-family: Arial, Helvetica, sans-serif; }`, which
beats the `--font-geist-sans` variable that `layout.tsx` sets up. The Geist fonts
are downloaded and never used. Change the rule to `var(--font-sans)`.

### 6. Inconsistent service filenames
`session.services.ts` and `notification.services.ts` use a plural `services` where
every other service file uses the singular. Rename now, while nothing imports them.

### 7. Default metadata
`layout.tsx` still advertises `title: "Create Next App"`. It's the browser tab and
the link preview for the whole app.

### 8. `public/manifest.json` is empty
An empty manifest is worse than none — the browser will fetch and fail to parse
it. The PWA install prompt and mobile web push both depend on a valid manifest,
and web push additionally needs a service worker
(`public/firebase-messaging-sw.js`), which is not in the tree at all.

## Unresolved design questions

Things the scaffold implies but does not answer. Each needs a decision before the
relevant feature can be built.

1. **How does the scheduler run?** `scheduler.service.ts` needs a recurring
   trigger. Next.js route handlers only run on request. Options: Vercel Cron,
   Supabase `pg_cron` + Edge Function, or an external queue. This shapes the whole
   notifications feature.
2. **Where does session state live on the client?** No state library is installed.
   Server components plus `useState` may be enough; if not, that's a dependency
   decision.
3. **Validation library?** Nothing installed. Route handlers need request
   validation regardless.
4. **Testing?** No framework, no test files, no CI config. If tests matter, decide
   before there's a large untested surface.
5. **What is actually paywalled?** `features/payments` exists, but no free/paid
   boundary is defined anywhere.
6. **Does `schedule.service.ts` auto-generate sessions, or assist manual
   planning?** This is the core product question and it changes the data model.

## Suggested build order

Each step leaves the app in a working state.

**1 — Unblock the scaffold.** Fix issues 1, 2, 3, 5, 6, 7 above. Small, mechanical,
and it stops the mistakes from being copied.

**2 — Data foundation.** Install `@supabase/supabase-js` and `@supabase/ssr`.
Write `001_initial_schema.sql` with tables, RLS policies, and indexes. Generate
`src/types/database.ts`. Write `seed.sql`.

**3 — Auth.** `lib/supabase/{client,server,middleware}.ts` → `src/middleware.ts` →
`features/auth` → the `(auth)` pages and forms. End state: a user can sign up, log
in, and reach a protected empty dashboard.

**4 — UI primitives.** Replace the four `ui/` stubs with real components. Everything
after this depends on them.

**5 — Courses.** Full vertical slice — service, route handlers, hooks, pages,
components. This is the template for every slice that follows.

**6 — Sessions.** Including the `/complete` transition and derived streak/progress.
This is the product's core loop; get it right before adding anything around it.

**7 — Notifications.** Manifest, service worker, FCM registration, and whatever
scheduler trigger you settled on in question 1.

**8 — Payments.** Stripe checkout, the webhook with signature verification, and
subscription gating.

Auth and the data model come first because everything else assumes a `user_id` and
working RLS. Payments comes last because it's the only slice nothing else depends on.
