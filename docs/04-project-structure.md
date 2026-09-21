# 04 — Project Structure

Annotated tree of the repository. `(empty)` means the file exists but is 0 bytes.

```
stuhdee/
├── docs/                              These docs
├── public/
│   ├── manifest.json                  (empty) PWA manifest — needed for web push
│   ├── file.svg  globe.svg
│   ├── next.svg  vercel.svg  window.svg    create-next-app leftovers
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql     (empty) tables, RLS, indexes
│   └── seed.sql                       (empty) local dev fixtures
│
├── src/
│   ├── middleware.ts                  (empty) session refresh + route protection
│   │
│   ├── app/
│   │   ├── layout.tsx                 ✅ root layout, Geist fonts, default metadata
│   │   ├── page.tsx                   ✅ create-next-app starter page
│   │   ├── globals.css                ✅ Tailwind v4 import + theme tokens
│   │   ├── favicon.ico
│   │   ├── settings/page.tsx          (empty) ⚠ outside the (dashboard) group
│   │   │
│   │   ├── (auth)/                    route group — no URL segment
│   │   │   ├── layout.tsx             (empty) minimal chrome
│   │   │   ├── login/page.tsx         (empty) → /login
│   │   │   └── signup/page.tsx        (empty) → /signup
│   │   │
│   │   ├── (dashboard)/               route group — no URL segment
│   │   │   ├── dashboard/page.tsx     (empty) → /dashboard
│   │   │   └── courses/
│   │   │       ├── page.tsx           (empty) → /courses
│   │   │       ├── new/page.tsx       (empty) → /courses/new
│   │   │       └── [id]/page.tsx      (empty) → /courses/:id
│   │   │       ⚠ no layout.tsx — nav/sidebar have nowhere to mount
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── callback/route.ts  (empty) OAuth / PKCE code exchange
│   │       │   └── signout/route.ts   (empty)
│   │       ├── courses/
│   │       │   ├── routes.ts          (empty) ⚠ misnamed — must be route.ts
│   │       │   └── [id]/route.ts      (empty)
│   │       ├── sessions/
│   │       │   ├── route.ts           (empty)
│   │       │   └── [id]/
│   │       │       ├── route.ts       (empty)
│   │       │       └── complete/route.ts  (empty) session completion
│   │       └── notifications/
│   │           ├── route.ts           (empty)
│   │           └── webhooks/stripe/route.ts  (empty) ⚠ payments webhook under notifications
│   │
│   ├── features/                      domain layer — see 03-architecture.md
│   │   ├── auth/
│   │   │   ├── types.ts               (empty)
│   │   │   ├── hooks/useAuth.ts       (empty) sign in / out / up
│   │   │   ├── hooks/useUser.ts       (empty) current user
│   │   │   └── services/auth.service.ts   (empty)
│   │   ├── courses/
│   │   │   ├── types.ts               (empty)
│   │   │   ├── hooks/useCourses.ts    (empty) list
│   │   │   ├── hooks/useCourse.ts     (empty) single
│   │   │   ├── services/course.service.ts     (empty) CRUD
│   │   │   └── services/schedule.service.ts   (empty) schedule generation
│   │   ├── sessions/
│   │   │   ├── types.ts               (empty)
│   │   │   ├── hooks/useSessions.ts   (empty)
│   │   │   └── services/session.services.ts   (empty) ⚠ plural "services"
│   │   ├── notifications/
│   │   │   ├── types.ts               (empty)
│   │   │   ├── services/notification.services.ts  (empty) ⚠ plural
│   │   │   └── services/scheduler.service.ts      (empty) when reminders fire
│   │   └── payments/
│   │       ├── types.ts               (empty)
│   │       ├── hooks/useSubscription.ts       (empty)
│   │       └── services/payments.service.ts   (empty)
│   │
│   ├── lib/
│   │   ├── utils.ts                   (empty) shared helpers (likely cn())
│   │   ├── constants.ts               (empty)
│   │   ├── supabase/
│   │   │   ├── client.ts              (empty) browser client
│   │   │   ├── server.ts              (empty) server/RSC client
│   │   │   └── middleware.ts          (empty) cookie refresh helper
│   │   ├── stripe/client.ts           (empty)
│   │   └── firebase/messaging.ts      (empty) FCM token + foreground handler
│   │
│   ├── components/
│   │   ├── ui/                        🟡 placeholder stubs — render their own name
│   │   │   ├── button.tsx  card.tsx  input.tsx  modal.tsx
│   │   ├── auth/
│   │   │   ├── auth-guard.tsx  login-form.tsx  signup-form.tsx    (all empty)
│   │   ├── layout/
│   │   │   ├── nav.tsx  sidebar.tsx  footer.tsx                   (all empty)
│   │   ├── dashboard/
│   │   │   ├── study-session-card.tsx  streak-counter.tsx
│   │   │   └── progress-bar.tsx                                   (all empty)
│   │   └── courses/
│   │       ├── course-card.tsx  course-list.tsx  course-form.tsx  (all empty)
│   │
│   └── types/
│       ├── database.ts                (empty) Supabase-generated row types
│       ├── api.ts                     (empty) request/response shapes
│       └── index.ts                   (empty) barrel
│
├── package.json  pnpm-lock.yaml  pnpm-workspace.yaml
├── tsconfig.json  next.config.ts  eslint.config.mjs  postcss.config.mjs
├── .gitignore
└── README.md                          create-next-app default
```

Legend: ✅ has real content · 🟡 placeholder stub · `(empty)` 0 bytes · ⚠ see [07](./07-implementation-status.md)

## Naming conventions

Observed from the scaffold — worth holding to:

| Thing | Convention | Example |
| --- | --- | --- |
| Files and folders | `kebab-case` | `study-session-card.tsx` |
| Services | `<domain>.service.ts` | `course.service.ts` |
| Hooks | `use<Thing>.ts`, camelCase | `useSubscription.ts` |
| Route handlers | `route.ts` (Next.js requirement) | `api/sessions/route.ts` |
| Dynamic segments | `[id]` | `courses/[id]/page.tsx` |
| Route groups | `(name)` | `(dashboard)` |
| Imports | `@/` alias, not relative chains | `@/features/courses/types` |

Two files break the service convention with a plural `.services.ts`
(`session.services.ts`, `notification.services.ts`). Worth renaming now while
nothing imports them.

## The workspace

`pnpm-workspace.yaml` declares `packages: [.]` — a single-package workspace, not a
monorepo. It also pins `ignoredBuiltDependencies: [sharp, unrs-resolver]`, which
suppresses pnpm's build-script approval prompt for those two transitive
dependencies of Next.js.
