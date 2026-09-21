# 06 — API Reference

> **Status:** every route handler listed here is an **empty file**. The paths and
> HTTP verbs below are the routes the file tree defines; the request and response
> bodies are *Proposed* and exist to be agreed on before implementation.

All routes live under `src/app/api/`. Next.js App Router route handlers export
named functions per verb (`GET`, `POST`, `PATCH`, `DELETE`) from a file that
**must** be called `route.ts`.

## Route inventory

| Method | Path | File | Purpose |
| --- | --- | --- | --- |
| GET | `/api/auth/callback` | `auth/callback/route.ts` | Exchange auth code for a session |
| POST | `/api/auth/signout` | `auth/signout/route.ts` | Clear session |
| GET / POST | `/api/courses` | `courses/routes.ts` ⚠ | List / create courses |
| GET / PATCH / DELETE | `/api/courses/[id]` | `courses/[id]/route.ts` | Single course |
| GET / POST | `/api/sessions` | `sessions/route.ts` | List / create study sessions |
| GET / PATCH / DELETE | `/api/sessions/[id]` | `sessions/[id]/route.ts` | Single session |
| POST | `/api/sessions/[id]/complete` | `sessions/[id]/complete/route.ts` | Mark complete |
| GET / POST | `/api/notifications` | `notifications/route.ts` | List / register device |
| POST | `/api/notifications/webhooks/stripe` | `notifications/webhooks/stripe/route.ts` | Stripe events ⚠ |

⚠ **`courses/routes.ts` is misnamed.** Next.js only recognises `route.ts`
(singular). As it stands, `/api/courses` does not exist as an endpoint — the file
is inert. Rename it before writing the handler.

⚠ **The Stripe webhook is filed under `notifications/`.** See
[07](./07-implementation-status.md).

---

## Auth

### `GET /api/auth/callback`
Supabase redirects here after email confirmation or an OAuth flow, with a `code`
query parameter. The handler exchanges the code for a session, sets the cookie,
and redirects onward.

```
Query:  ?code=<string>&next=<path>
→ 302   to `next` (default /dashboard), Set-Cookie: session
→ 302   to /login?error=... on failure
```

### `POST /api/auth/signout`
Clears the Supabase session cookie. Should be a POST, not a GET, so that link
prefetchers and image loaders cannot sign the user out.

```
→ 204  No Content
```

---

## Courses

### `GET /api/courses`
```jsonc
// → 200
{ "courses": [ { "id": "uuid", "title": "…", "code": "CSC 201",
                 "color": "#7c3aed", "targetHoursPerWeek": 6,
                 "archivedAt": null } ] }
```
Excludes archived courses unless `?includeArchived=true`.

### `POST /api/courses`
```jsonc
// body
{ "title": "Data Structures", "code": "CSC 201",
  "color": "#7c3aed", "targetHoursPerWeek": 6,
  "startsOn": "2026-09-01", "endsOn": "2026-12-15" }
// → 201  { "course": { … } }
// → 400  { "error": "validation_failed", "fields": { "title": "required" } }
```

### `GET | PATCH | DELETE /api/courses/[id]`
`PATCH` accepts a partial course body. `DELETE` should **soft-delete** by setting
`archived_at` — a hard delete would cascade away the completed sessions that back
the user's streak history.

```
→ 200  { "course": { … } }
→ 404  { "error": "not_found" }      // also the correct response for
                                     // another user's course — never 403,
                                     // which would confirm the row exists
```

---

## Sessions

### `GET /api/sessions`
The dashboard's primary query.

```
Query:  ?from=<iso>&to=<iso>&courseId=<uuid>&status=scheduled|completed|skipped
→ 200   { "sessions": [ … ] }
```

### `POST /api/sessions`
```jsonc
{ "courseId": "uuid",
  "scheduledStart": "2026-09-22T09:00:00Z",
  "scheduledEnd":   "2026-09-22T10:30:00Z" }
// → 201 { "session": { … , "status": "scheduled" } }
```

### `POST /api/sessions/[id]/complete`
The one genuinely interesting endpoint. It exists separately because completion is
a **state transition with side effects**, not a field edit: it sets `status` and
`completed_at`, records `actualMinutes`, and recomputes what the streak and
progress displays read.

```jsonc
// body (all optional)
{ "actualMinutes": 85, "notes": "finished chapter 4" }

// → 200
{ "session": { "id": "…", "status": "completed",
               "completedAt": "2026-09-22T10:25:00Z" },
  "streak":  { "current": 7, "longest": 12 } }

// → 409  { "error": "already_completed" }
```

Returning the recalculated streak in the same response lets the UI update the
counter without a second round trip.

**Make this idempotent.** A double-tapped "complete" button on a flaky mobile
connection should not double-count a session; re-completing an already-completed
session should return `409` or the unchanged resource, never silently advance the
streak.

---

## Notifications

### `GET /api/notifications`
Returns the user's notification history.

### `POST /api/notifications`
Registers an FCM device token so the browser can receive push.

```jsonc
{ "fcmToken": "…", "userAgent": "…" }
// → 201
```
Upsert on `fcm_token` — the same browser re-registers on every page load, and a
plain insert would pile up duplicate rows.

---

## Webhooks

### `POST /api/notifications/webhooks/stripe`
Receives Stripe events and syncs the `subscriptions` table.

Non-negotiables for this handler:

1. **Verify the signature.** Read the raw body and check the `stripe-signature`
   header with `stripe.webhooks.constructEvent` and the webhook secret. An
   unverified webhook endpoint lets anyone grant themselves a subscription.
2. **Read the body raw.** Next.js route handlers give you `await req.text()`;
   parsing to JSON first breaks signature verification.
3. **Be idempotent.** Stripe retries, and events can arrive out of order. Key on
   `event.id` and ignore events older than the row's current state.
4. **Use the service-role client**, not the cookie-scoped one — there is no user
   session on a webhook request.

Events to handle: `checkout.session.completed`,
`customer.subscription.created|updated|deleted`, `invoice.payment_failed`.

```
→ 200  { "received": true }     // always 200 once verified, or Stripe retries
→ 400  signature verification failed
```

---

## Conventions — *Proposed*

Worth settling before the first handler is written, because retrofitting is
tedious:

- **Casing.** `camelCase` in JSON, `snake_case` in Postgres; map at the service
  boundary.
- **Errors.** A consistent shape — `{ "error": "<machine_code>", "message": "<human>" }`.
- **Status codes.** `200` read, `201` create, `204` empty, `400` validation,
  `401` unauthenticated, `404` missing *or not yours*, `409` conflict, `429` rate
  limited.
- **Validation.** Validate every request body at the route boundary. No schema
  library is installed yet; adding one (Zod or similar) is an open decision.
- **Shared types.** Request/response interfaces belong in `src/types/api.ts` so
  the client hooks and the handlers compile against one definition.
