# 05 — Data Model

> **Everything on this page is *Proposed*.** `supabase/migrations/001_initial_schema.sql`
> and `supabase/seed.sql` are empty, and `src/types/database.ts` is empty. No schema
> exists. What follows is a reconstruction from the feature folders and component
> names, offered as a starting point for the first migration — review and change it
> freely before writing any SQL.

## Entities and relationships

```
auth.users  (managed by Supabase Auth)
     │
     ├──1:1──► profiles              display name, timezone, preferences
     │
     ├──1:N──► courses               what the student is studying
     │              │
     │              └──1:N──► study_sessions     scheduled + completed work
     │
     ├──1:1──► subscriptions         Stripe state
     │
     ├──1:N──► devices               FCM tokens for push
     │
     └──1:N──► notifications         queued / sent reminders
```

`study_sessions` is the centre of gravity: streaks, progress bars, and the
completion endpoint all read from it.

## Tables

### `profiles`
One row per user, keyed to `auth.users.id`. Holds what Supabase Auth doesn't:
display name, avatar, and — importantly for a reminder app — the user's
**timezone**, since the scheduler needs it to fire notifications at a sensible
local hour.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | FK → `auth.users(id)` on delete cascade |
| `display_name` | `text` | |
| `avatar_url` | `text` | nullable |
| `timezone` | `text` | IANA name, e.g. `Africa/Lagos`; default `UTC` |
| `created_at` / `updated_at` | `timestamptz` | |

### `courses`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `user_id` | `uuid` | FK → `auth.users(id)`, cascade |
| `title` | `text` | required |
| `code` | `text` | nullable, e.g. `CSC 201` |
| `description` | `text` | nullable |
| `color` | `text` | for UI chips and calendar blocks |
| `target_hours_per_week` | `numeric` | input to `schedule.service.ts` |
| `starts_on` / `ends_on` | `date` | term boundaries; nullable |
| `archived_at` | `timestamptz` | soft delete — keeps history intact |
| `created_at` / `updated_at` | `timestamptz` | |

Index: `(user_id, archived_at)` — the list view's main query.

Soft-deleting via `archived_at` rather than a hard `DELETE` matters here: deleting
a course would otherwise destroy the completed sessions behind a user's streak.

### `study_sessions`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `user_id` | `uuid` | FK, cascade — denormalised so RLS needs no join |
| `course_id` | `uuid` | FK → `courses(id)` |
| `scheduled_start` / `scheduled_end` | `timestamptz` | planned slot |
| `status` | `text` | `scheduled` \| `in_progress` \| `completed` \| `skipped` |
| `started_at` | `timestamptz` | nullable |
| `completed_at` | `timestamptz` | nullable; set by the `/complete` endpoint |
| `actual_minutes` | `integer` | nullable |
| `notes` | `text` | nullable |
| `created_at` / `updated_at` | `timestamptz` | |

Indexes: `(user_id, scheduled_start)` for the dashboard's upcoming list, and
`(user_id, status, completed_at)` for streak computation.

Carrying `user_id` directly (rather than reaching it through `course_id`) lets RLS
policies stay single-table, which keeps them both faster and easier to audit.

### `subscriptions`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `user_id` | `uuid` | FK, unique — one subscription per user |
| `stripe_customer_id` | `text` | unique |
| `stripe_subscription_id` | `text` | unique, nullable |
| `status` | `text` | mirrors Stripe: `active`, `trialing`, `past_due`, `canceled`, … |
| `price_id` | `text` | which plan |
| `current_period_end` | `timestamptz` | drives access checks |
| `cancel_at_period_end` | `boolean` | |

Written **only** by the Stripe webhook. Client code reads this table and never
writes it — Stripe is the source of truth.

### `devices`
FCM registration tokens, one row per browser/device, so a user with a laptop and a
phone gets both notified.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `user_id` | `uuid` | FK, cascade |
| `fcm_token` | `text` | unique |
| `user_agent` | `text` | nullable, for debugging |
| `last_seen_at` | `timestamptz` | prune stale tokens |

### `notifications`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `user_id` | `uuid` | FK, cascade |
| `session_id` | `uuid` | FK → `study_sessions(id)`, nullable |
| `type` | `text` | `session_reminder`, `streak_at_risk`, `payment_failed`, … |
| `title` / `body` | `text` | |
| `send_at` | `timestamptz` | when the scheduler should fire it |
| `sent_at` | `timestamptz` | nullable |
| `read_at` | `timestamptz` | nullable |

Index: `(send_at)` filtered on `sent_at IS NULL` — the scheduler's poll query.

## Derived values, not columns

**Streaks** should be computed from `study_sessions`, not stored as a counter.
A stored counter drifts the moment a write fails or a session is un-completed, and
the query is cheap against the `(user_id, status, completed_at)` index. The same
goes for the progress bar — derive it from completed vs. scheduled sessions.

If streak computation ever becomes a measured bottleneck, cache it; don't start
there.

## Row Level Security

Every table above must have RLS **enabled** with policies scoping access to
`auth.uid() = user_id`. This is the actual security boundary of the app — the
middleware and `auth-guard.tsx` are UX, not enforcement.

Two exceptions to plan for:
- `subscriptions` — user-readable, but writable only by the service role (the
  webhook). Do not grant users `UPDATE`.
- `notifications` — users may mark their own rows read; inserts come from the
  server.

## Type generation

Once the migration exists, `src/types/database.ts` should be **generated**, not
hand-written:

```bash
pnpm dlx supabase gen types typescript --project-id <ref> > src/types/database.ts
```

Treat that file as build output. Hand-edits will be lost on the next run, and a
hand-maintained copy silently drifts from the real schema.
