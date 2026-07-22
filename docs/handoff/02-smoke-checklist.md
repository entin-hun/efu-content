# 02 — Post-deploy Smoke Checklist

Goal: confirm the production environment is healthy, accessible, and capable
of taking a paid purchase → turning on the stream → playing the stream, all
within **10 minutes** of the deploy finishing.

This is the lean subset of the L10-QA smoke. Use the L10-QA suite for full
regression; this doc is for the on-call person in the first 10 minutes after
cutover.

> **When to use**: copy-paste this list into a terminal `tmux` session right
> after `vercel deploy --prod` returns. Mark each item green/red as you go.
> Anything red → escalate (`03-oncall-rotation.md`).
>
> **Pass criteria**: every line is green. A single red is enough to block the
> launch announcement; two or more reds → roll back (see runbook §9).

## How to fill this in

Run each step from a laptop with a clean browser profile (private window is
fine). For CLI steps, your machine needs `curl`, `openssl`, and `jq` installed.
The clipboard for the Stripe and Supabase values is in your password manager.

```
Deploy URL:    ________________________
Operator:      ________________________
Started at:    __:__ UTC
Finished at:   __:__ UTC  (target ≤ 10 min after start)
Result:        GREEN / YELLOW / RED
```

## A — DNS / TLS (target: 1 min)

- [ ] **A.1** `dig +short stream.elitefightuniverse.hu` resolves to a Cloudflare IP (not a parking page).
- [ ] **A.2** `curl -sI https://stream.elitefightuniverse.hu | head -1` returns `HTTP/2 200`.
- [ ] **A.3** TLS cert is valid (cert SAN contains the apex + `www`). Open in a private browser window, click the padlock, expiry > 30 days.
- [ ] **A.4** `https://stream.elitefightuniverse.hu/status` returns `{"status":"ok"}` with HTTP 200.

## B — Static + dynamic render (target: 2 min)

- [ ] **B.1** Landing page (`/`) renders without console errors. Lighthouse ≥ 80 on Performance + Accessibility.
- [ ] **B.2** `/rolunk`, `/hirek`, `/szponzorok`, `/kapcsolat` each render 200 (or 404 if not yet built — confirm expected state in the operations log).
- [ ] **B.3** `/teaser` (free preview) renders the placeholder player frame.
- [ ] **B.4** No `Failed to load resource` or `Mixed content` errors in the DevTools console on any page.

## C — Auth (target: 2 min)

- [ ] **C.1** `Sign in` button opens the auth modal/page.
- [ ] **C.2** Magic-link or OAuth login works end to end with the operator's test account.
- [ ] **C.3** After login, the user lands back on the original page (no 404 loop).

## D — Stripe Checkout (target: 2 min)

- [ ] **D.1** Pricing CTA → `/api/checkout` issues a 303 to a `checkout.stripe.com/...` URL with the right price id.
- [ ] **D.2** Stripe Checkout page loads the **2500 HUF** line item.
- [ ] **D.3** Card `4242 4242 4242 4242` (exp future, CVC 123) completes successfully.
- [ ] **D.4** On success, the user lands on `/success?session_id=…` and the order id is shown.
- [ ] **D.5** `tail -n 200 /var/log/.../app.log | grep "checkout.session.completed"` (or your log sink) shows the webhook arrived within 30 s of step D.4. If using a log drain, query the sink.

## E — Webhook → entitlement (target: 1 min)

- [ ] **E.1** The test user from D.3 appears in the `tickets` (or equivalent) table with `status='active'`.
- [ ] **E.2** The user's app session now has an `entitlement` flag (e.g. cookie or JWT claim) — reloading `/watch` should show the player, not the paywall.

## F — Stream playback (target: 2 min)

> Only run F.1–F.2 against the production CF Stream ID **if** a real test
> broadcast is scheduled. For the launch dry-run, use a pre-recorded HLS
> manifest that you've already uploaded to Cloudflare Stream (a "video on
> demand" backup). Document which manifest id is used for smoke in the
> operations log.

- [ ] **F.1** `/api/get-stream-token` returns a non-empty JWT for an entitled user; 403 for an anonymous user.
- [ ] **F.2** `/watch` calls `hls.js` and the player goes from `loading` → `playing` (or, for VOD, `buffering` → `playing`) within 10 s.
- [ ] **F.3** The Cloudflare Stream dashboard shows the playback UID with a recent view event (token-issue logs do not count).
- [ ] **F.4** Unsigned playback URL (e.g. without a token) returns 403 from Cloudflare directly. Try `curl -I https://customer-<CODE>.cloudflarestream.com/<UID>/manifest/video.m3u8` — should be 4xx.

## G — Status + observability (target: 30 s)

- [ ] **G.1** `/status` returns `200` with `{"status":"ok"}` (or whatever the live JSON shape is — capture in the operations log).
- [ ] **G.2** The log sink (see `04-source-maps-and-logs.md`) received at least one event in the last 60 s.
- [ ] **G.3** Sentry (or equivalent) shows **zero** new errors in the last 60 s.
- [ ] **G.4** The Stripe webhook log on stripe.com shows the test event as `succeeded`.

## H — Performance rough-cut (target: 1 min)

- [ ] **H.1** TTFB on `/` from the production region: `< 800 ms` (curl with `-w '%{time_starttransfer}\n'`).
- [ ] **H.2** `/api/checkout` p95 (5 calls): `< 1500 ms`.
- [ ] **H.3** `/api/get-stream-token` p95 (5 calls): `< 400 ms`.

## Decision matrix

| Result | Action |
|--------|--------|
| All green | Sign off in operations log, announce launch in `#efu-ops`. Stay on the first-hour watch. |
| 1 yellow (non-F, non-G) | Restart the deploy (Vercel will keep the previous green deploy). Re-run smoke. |
| 1 red (anywhere) | **Do not announce.** Open the rollback runbook (§9) and roll back. Open an incident entry in operations log. |
| 2+ reds | Roll back immediately. Open a Sev2 (see `03-oncall-rotation.md`). |

## What to do if Stripe is dead

If `checkout.stripe.com` is itself down, smoke D and E will fail but nothing
on our side is broken. Pause the launch, status-page the operator comment, and
wait. **Don't roll back** in this case — that just makes the recovery slower.

## What to do if Cloudflare is dead

If Cloudflare Stream is dropping events, F will fail. Same as above — pause,
don't roll back.

## What to do if Supabase is dead

If Supabase (Postgres or Auth) is down, C and E will fail. Page secondary
on-call (`03-oncall-rotation.md`). Don't roll back the app — Supabase has its
own status page.

## Closing

When all checks are green, write the deploy id + smoke timestamp to the
operations log in `03-oncall-rotation.md`. Then move to first-hour monitoring
from the runbook §8.
