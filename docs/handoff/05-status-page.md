# 05 — Status page

Goal: when something is broken, paying users (and prospective ones watching the
teaser) can see "we know, we're working on it" instead of a 500 page they
share on social media. Two layers, pick both:

1. **An in-app `/status` route** — implemented at `app/status/route.ts`. Cheap,
   always-on, tells the world the app itself is alive.
2. **An external status page** (Better Uptime / Instatus / Statuspage) — for
   richer incidents with history, components, and subscribers.

## 1. The `/status` route

The simplest status page is a JSON endpoint. We've implemented it at
`app/status/route.ts`. It returns:

```json
{
  "status": "ok",
  "service": "mma-stream",
  "version": "1.0.0",
  "env": "production",
  "build": { "sha": "<git-sha>", "time": "<iso8601>" },
  "now": "<iso8601>"
}
```

Why this is intentionally minimal:

- **No DB query** — checking Postgres from the status endpoint couples the
  status of "the app" to the status of "the DB". If the DB is down but the
  app serves the marketing pages fine, the status page is still 200. The
  monitoring probe alerts the on-call directly.
- **No auth** — this is the one endpoint that must be reachable anonymously.
- **Cached at the edge for 30 s** — enough to absorb inexpensive monitoring
  pings (5–10/minute per monitor × 3 monitors) without becoming a load source.

### 1.1 Adding an HTML wrapper (optional)

A grep-friendly JSON endpoint is the right thing for monitoring; humans
prefer HTML. Drop a `app/status/page.tsx` that wraps the same JSON in a clean
layout:

```tsx
// app/status/page.tsx
import Link from 'next/link';
import { getStatus } from './service'; // see below

export const revalidate = 30;

export default async function StatusPage() {
  const s = await getStatus();
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold mb-2">EFU Stream — System Status</h1>
      <p className={s.ok ? 'text-green-600' : 'text-red-600'}>
        {s.ok ? 'All systems operational' : 'Incident in progress — see timeline below'}
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-4">
        <dt>Build</dt><dd>{s.build.sha}</dd>
        <dt>Deployed at</dt><dd>{s.build.time}</dd>
      </dl>
      <p className="mt-6 text-sm">Subscribe at <Link href="/status/feed.rss">/status/feed.rss</Link> for incidents.</p>
    </main>
  );
}
```

The `service.ts` would hit the same `/status` route via `fetch` and return
the parsed body. Caching at 30s is fine.

### 1.2 Smoke check

Add this to the post-deploy smoke (`02-smoke-checklist.md` A.4):

```bash
curl -sS https://stream.elitefightuniverse.hu/status | jq .
# expect: { "status": "ok", "service": "mma-stream", ... }
```

## 2. Components to monitor — the layered view

The status page should not just say "ok / not ok". It should expose the major
components so users (and the on-call) can see which one is broken:

| Component | What it means | How it's probed |
|---|---|---|
| **Web app** | Marketing site + auth pages render | `GET /` returns 200, no 5xx in the last 5 min |
| **API** | `/api/*` route handlers respond | `GET /api/checkout` (HEAD) returns 200/303, p95 < 1500 ms |
| **Payments (Stripe)** | Stripe Checkout + webhook flow | `GET /api/checkout` issues a 303 to `checkout.stripe.com`; webhook log on Stripe dashboard |
| **Auth (Supabase)** | Sign-in works | magic-link dispatch from `/api/auth/start` returns 200 |
| **Database** | Postgres queries serve | `SELECT 1` via Supabase REST, p95 < 200 ms |
| **Live stream (CF Stream)** | Live broadcast reachable | signed-URL probe from an entitled test user returns a 200 manifest |
| **CDN / DNS** | The site resolves globally | Cloudflare analytics shows expected country distribution |

The `/status` route covers **Web app** and **API**. Everything else goes on the
external status page (next section).

## 3. External status page

For richer incidents — and to give paying users a feed they can subscribe to
without us building email/SMS infrastructure — use a hosted status page. Pick
one:

- **Instatus** — paid, but the cheapest ($20/mo Starter). Good looking out of
  the box. Supports custom domain like `status.stream.…`.
- **Better Uptime** — best value if you also need synthetic monitoring. The
  $20/mo plan covers both status and monitoring.
- **Statuspage by Atlassian** — the default, $29/mo Standard. Has the most
  integrations but is the most expensive.

### 3.1 Recommended setup (Instatus)

1. Create a status page at `status.stream.elitefightuniverse.hu` (CNAME into
   Instatus's automatic DNS; the provider tells you the target).
2. Add the components listed in §2 above.
3. Connect the team's incident channel: when someone opens a Sev1 in
   `#efu-ops`, the channel bot can call Instatus's API to post the incident.
4. Add a "Subscribe" panel — users get emailed when an incident is opened or
   resolved. Embed the embed widget in `/about` if desired.

### 3.2 Manual updates (when no integration is set up)

Until the integration is wired, the **on-call** is responsible for posting
status-page updates. The rule is short and unbreakable:

- A **Sev1** gets a status-page update within 5 minutes of ack — even if the
  message is just "Investigating reports of failed checkouts."
- A **Sev2** gets an update within 15 minutes.
- An **"all clear"** update posts within 15 minutes of mitigation.

## 4. Where each thing lives

| Surface | URL | Owner |
|---|---|---|
| In-app JSON status | `https://stream.elitefightuniverse.hu/status` | This repo (`app/status/route.ts`) |
| In-app HTML status (optional) | `https://stream.elitefightuniverse.hu/status` (same path, served by `page.tsx` precedence) | This repo (`app/status/page.tsx`) |
| Public status page | `https://status.stream.elitefightuniverse.hu` | Instatus / Better Uptime / Statuspage |
| War-room chat | `#efu-ops` (Slack) | The on-call |
| Operations log | `docs/handoff/03-oncall-rotation.md` §8 | The on-call (append-only) |
