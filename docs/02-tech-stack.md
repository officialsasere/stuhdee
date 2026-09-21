# 02 — Tech Stack

## Installed today

These are the only packages in `package.json` and `pnpm-lock.yaml`.

| Package | Version | Role |
| --- | --- | --- |
| `next` | 16.1.1 | Framework — App Router, server components, route handlers |
| `react` / `react-dom` | 19.2.3 | UI runtime |
| `typescript` | ^5 (5.9.3 locked) | Language, `strict: true` |
| `tailwindcss` | ^4 (4.1.18 locked) | Styling, CSS-first config |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin — Tailwind v4's build path |
| `eslint` | ^9 (9.39.2 locked) | Linting, flat config |
| `eslint-config-next` | 16.1.1 | Next.js core-web-vitals + TypeScript rules |

Toolchain: **pnpm 10.22.0** (single-package workspace), **Node 25.8.0** locally.

## Planned but not installed — *Proposed*

The folder structure references three external services whose SDKs are **absent
from `package.json` and the lockfile**. They will need to be added before the
corresponding files can be written.

| Service | Referenced by | Likely package(s) |
| --- | --- | --- |
| Supabase | `src/lib/supabase/{client,server,middleware}.ts`, `supabase/migrations/`, `api/auth/callback` | `@supabase/supabase-js`, `@supabase/ssr` |
| Stripe | `src/lib/stripe/client.ts`, `api/notifications/webhooks/stripe` | `stripe` (server), `@stripe/stripe-js` (browser) |
| Firebase | `src/lib/firebase/messaging.ts` | `firebase` (for Cloud Messaging) |

The three-file Supabase split (`client` / `server` / `middleware`) is the exact
layout `@supabase/ssr` prescribes for the Next.js App Router, which is strong
evidence that package is the intended choice.

Also worth noting: there is **no test framework installed** and no test files. If
testing matters for this project, that decision is still open — see
[07 — Implementation Status](./07-implementation-status.md).

## Notable configuration

### Tailwind v4
Tailwind is configured CSS-first. There is no `tailwind.config.js`; theme tokens
live in `src/app/globals.css` inside an `@theme inline { ... }` block, and the
build runs through `postcss.config.mjs`. Add new design tokens to `globals.css`,
not to a JS config file.

### TypeScript
`strict: true`, `noEmit: true` (Next handles the build), bundler module
resolution, and a single path alias:

```
"@/*" → "./src/*"
```

Import across the app with `@/features/...`, `@/lib/...`, `@/components/...`
rather than relative `../../../` chains.

### ESLint
Flat config (`eslint.config.mjs`) composing `core-web-vitals` and `typescript`
presets from `eslint-config-next`. Note that the `lint` script is bare `eslint`
with no path argument, which lints the current directory.

### Next.js
`next.config.ts` is empty — defaults only. No image domains, redirects, or
experimental flags are set yet.

### Dark mode
`globals.css` implements dark mode via `@media (prefers-color-scheme: dark)`
overriding `--background` / `--foreground` on `:root`. This is OS-preference only;
there is no in-app theme toggle, and adding one would require switching to a
class or `data-theme` strategy.

### A known inconsistency
`globals.css` sets `body { font-family: Arial, Helvetica, sans-serif; }`, which
overrides the Geist fonts that `layout.tsx` loads and exposes as `--font-geist-sans`.
The fonts are wired up but not actually applied. Flagged in
[07 — Implementation Status](./07-implementation-status.md).
