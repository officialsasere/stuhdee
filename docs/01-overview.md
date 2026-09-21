# 01 — Overview

## What Stuhdee is

Stuhdee is a **study planning and habit-tracking web app for students**. A user
registers courses they are taking, the app builds a study schedule from them, and
the user works through timed study sessions. Progress, completion, and streaks are
tracked to keep the habit going, and push notifications remind the user when a
session is due. A paid tier is gated behind a subscription.

> **Status:** *Inferred.* There is no product brief, issue tracker, or README
> content in the repo describing the product. The description above is read off the
> directory structure — `features/courses`, `features/sessions`,
> `features/notifications`, `features/payments`, and components named
> `streak-counter`, `progress-bar`, `study-session-card`. Treat it as a reading of
> intent, and correct it here once the real product definition is written down.

## Feature areas

The codebase is organised into five feature domains. Each one currently exists as
an empty folder skeleton under `src/features/`.

### Auth — *Scaffolded*
Email/password signup and login, session management, and route protection.
Supabase Auth is the intended provider, based on `src/lib/supabase/` and the
`api/auth/callback` route (the shape of a Supabase OAuth/PKCE code exchange).

### Courses — *Scaffolded*
CRUD for the courses a student is enrolled in. A separate `schedule.service.ts`
suggests the app derives a study schedule from course data rather than having the
user hand-place every session.

### Sessions — *Scaffolded*
Individual study sessions: the unit of work the student actually completes. The
dedicated `api/sessions/[id]/complete` route means completion is a distinct
state transition, not just a field update — likely because completing a session is
what advances streaks and progress.

### Notifications — *Scaffolded*
Push reminders via Firebase Cloud Messaging (`src/lib/firebase/messaging.ts`),
with a `scheduler.service.ts` to decide when reminders fire. The empty
`public/manifest.json` indicates the app is also intended to be an installable PWA,
which is a prerequisite for web push on mobile.

### Payments — *Scaffolded*
Stripe subscriptions (`src/lib/stripe/client.ts`, `useSubscription` hook) with a
webhook endpoint to keep subscription state in sync.

## Current state in one paragraph

The repository contains a single commit, `4120cf7 "stuhdee structure"`, which
created a complete Next.js 16 App Router skeleton. What runs today is the
unmodified `create-next-app` starter page. Of the 61 files under `src/` and
`supabase/`, 57 are empty, and the 4 that aren't are placeholder React components
that render their own name. No feature code, no database schema, and none of the
third-party SDKs have been installed yet.

This is a greenfield project at the "folders are laid out, now build it" stage.
The value of the scaffold is that it encodes a clear architectural opinion — see
[03 — Architecture](./03-architecture.md).
