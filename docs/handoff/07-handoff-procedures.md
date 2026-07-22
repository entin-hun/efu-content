# 07 — Handoff procedures (day-to-day ops)

Goal: when someone other than the developer who built the system needs to do
an everyday operation, they can do it from this document alone. The four
operations EFU hands off to non-technical staff are:

1. **Add a new admin user.**
2. **Push a new news article.**
3. **Schedule a new vote** (reality-show voting).
4. **Launch a new live stream** (go live on a scheduled event day).

> **Operator skill floor.** These procedures assume the operator can run
> `supabase`, `vercel`, and `stripe` CLIs on their laptop, copy-paste SQL
> into a hosted Supabase SQL editor, and use the Cloudflare dashboard. If
> they can't, escalate to the developer on-call.

The screenshots and CLI commands below are written against the canonical
operators — Vercel for hosting, Supabase for data/auth, Stripe for payments,
Cloudflare for DNS+Stream.

---

## 1. Add a new admin user

### 1.1 What "admin" means in this app

The 6-role RBAC scheme is decided in L6 (Admin surface). As of this handoff
package, the EFU V1 contract ships only the **minimum role** needed for the
launch team:

- `super_admin` — full read/write on every table, including other admins'
  records and the audit log.
- `editor` — can publish `news` and `reality_*` content; cannot change
  prices or other users.

If a higher-resolution role model is required, defer to L6; otherwise treat
`super_admin` as the default for now.

### 1.2 Invite + role assignment via Supabase + RLS

```sql
-- 1. Confirm the user's auth.users row exists (they must have signed in
--    at least once via the magic-link / OAuth flow once you emailed them).
--    The user_id is shown in the URL bar of the Supabase dashboard:
--       Authentication → Users → click the row → copy the UUID.

-- 2. Insert or update the user's profile with the super_admin role:
INSERT INTO public.profiles (id, role, display_name, created_at)
VALUES (
  '<user-uuid-from-auth-users>',
  'super_admin',
  'New Admin Name',
  now()
)
ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin',
      display_name = EXCLUDED.display_name;

-- 3. Verify:
SELECT id, role, display_name FROM public.profiles WHERE role = 'super_admin';
```

### 1.3 First sign-in for the new admin

1. Tell the new admin to go to `https://stream.elitefightuniverse.hu/sign-in`.
2. They use **email magic link** (or OAuth, depending on L1's auth choice).
3. After sign-in, they navigate to `/admin` (the admin dashboard, gated by
   the `super_admin` RLS policy).
4. If `/admin` returns 403, run the SQL above — the magic-link sign-in
   creates an `auth.users` row but **does not** create the `profiles` row
   automatically.

### 1.4 Removing an admin

```sql
UPDATE public.profiles SET role = 'editor' WHERE id = '<user-uuid>';
-- or to remove access entirely:
DELETE FROM public.profiles WHERE id = '<user-uuid>';
```

Always also rotate the `SUPABASE_SERVICE_ROLE_KEY` after removing a
`super_admin` whose account was compromised. See `03-oncall-rotation.md` §7
for the rotation log.

---

## 2. Push a new news article

News lives in the `news` table (defined by the L6 schema — the columns below
are the canonical ones; substitute any column renames L6 introduces).

### 2.1 Schema (canonical)

```sql
CREATE TABLE public.news (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  title_hu     text NOT NULL,
  title_en     text,
  body_hu      text NOT NULL,
  body_en      text,
  hero_image   text,                 -- URL or path under /public
  published_at timestamptz NOT NULL DEFAULT now(),
  status       text NOT NULL DEFAULT 'draft',  -- 'draft' | 'published' | 'archived'
  author_id    uuid REFERENCES public.profiles(id),
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
```

### 2.2 Insert via Supabase SQL editor

```sql
INSERT INTO public.news (slug, title_hu, body_hu, published_at, status, author_id)
VALUES (
  'first-event-recap-2026-08-15',
  'Első esemény: beszámoló a 2026. augusztus 15-i gáláról',
  '<p>Body text in Hungarian. HTML allowed for bold/links/blockquote.</p>',
  now(),
  'published',
  '<your-admin-uuid>'
)
RETURNING id, slug, title_hu, status, published_at;
```

### 2.3 Insert via the admin UI (once L6 ships it)

Once the admin content CRUD ships in L6, the canonical path is the `/admin`
form. Until then, the Supabase SQL editor above is the source of truth.

### 2.4 Verify it shows up

1. Hard-reload the public homepage (Cmd-Shift-R / Ctrl-F5) — the news
   ticker reads `status = 'published' AND published_at <= now()`.
2. Open the article at `https://stream.elitefightuniverse.hu/hirek/<slug>`.
3. Check `now() AT TIME ZONE 'Europe/Budapest'` matches the published_at —
   articles dated in the future won't appear yet.

### 2.5 Unpublishing (archive)

```sql
UPDATE public.news SET status = 'archived' WHERE slug = 'first-event-recap-2026-08-15';
```

Archived articles stay in the DB (so re-publishing is reversible) but
disappear from the homepage.

---

## 3. Schedule a new vote (reality-show voting)

Voting is the L3 Reality feature. The schema here is the contract MVP's
candidate shape — adjust column names once L3 lands.

### 3.1 Schema (canonical)

```sql
CREATE TABLE public.votes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter_id    uuid NOT NULL REFERENCES public.fighters(id),
  season_id     uuid NOT NULL REFERENCES public.seasons(id),
  opens_at      timestamptz NOT NULL,
  closes_at     timestamptz NOT NULL,
  paid          boolean NOT NULL DEFAULT false,   -- true = paid sympathy vote
  price_huf     integer,                         -- 2500 if paid = true
  created_at    timestamptz DEFAULT now(),
  CONSTRAINT votes_window CHECK (closes_at > opens_at)
);
```

### 3.2 Schedule via the admin UI (eventually L3) OR via SQL

```sql
-- 1. Ensure the season exists. The contract MVP only has a single season
--    (a placeholder UUID is fine for now; replace after the spec lands):
INSERT INTO public.seasons (id, label_hu, label_en, starts_at, ends_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'EFU Szezon 1 (2026)',
  'EFU Season 1 (2026)',
  '2026-08-15T20:00:00+02:00',
  '2026-12-15T22:00:00+01:00'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Ensure the fighter exists:
INSERT INTO public.fighters (id, display_name_hu, slug)
VALUES (
  '00000000-0000-0000-0000-0000000000aa',
  'Példa Harcos',
  'pelda-harcos'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Schedule the vote (opens Sat 22:00, closes Sun 22:00 local time):
INSERT INTO public.votes (fighter_id, season_id, opens_at, closes_at, paid, price_huf)
VALUES (
  '00000000-0000-0000-0000-0000000000aa',
  '00000000-0000-0000-0000-000000000001',
  '2026-08-15T22:00:00+02:00',
  '2026-08-16T22:00:00+02:00',
  true,
  2500
)
RETURNING id, opens_at, closes_at;
```

### 3.3 Verify

```sql
SELECT
  v.id,
  f.display_name_hu AS fighter,
  v.opens_at AT TIME ZONE 'Europe/Budapest' AS opens_local,
  v.closes_at AT TIME ZONE 'Europe/Budapest' AS closes_local,
  v.paid, v.price_huf
FROM public.votes v
JOIN public.fighters f ON f.id = v.fighter_id
ORDER BY v.opens_at DESC
LIMIT 5;
```

Also: open `/szavazas` in the browser and confirm the vote is on the schedule
(now, or queued if `opens_at` is in the future).

### 3.4 Closing a vote early (in case of disqualification)

```sql
UPDATE public.votes SET closes_at = now() WHERE id = '<vote-uuid>';
```

The vote disappears from the public vote UI immediately. Tally happens on
close — wait 5 minutes before publishing the result.

---

## 4. Launch a new live stream (event day)

This is the most operationally critical handoff. A live event means paying
users are watching; mistakes cause refund requests and trust loss.

### 4.1 Pre-event (T-7 days)

1. **Cloudflare Stream**: confirm the right Live Input ID is in
   `CF_STREAM_ID`. Test it with OBS — push a low-bitrate preview for 60 s,
   pull the signed-URL token from `/api/get-stream-token`, open it in VLC,
   confirm video+audio.
2. **Stripe**: confirm `STRIPE_PRICE_ID` matches the event's season product.
   `stripe prices retrieve price_…` returns the price; cross-check the
   amount = 2500 HUF.
3. **Database**: confirm the season id, the live-event announcement article
   (procedure §2), and the scheduled vote (procedure §3) are all in place.
4. **Smoke**: run the full `02-smoke-checklist.md` against staging first; one
   last full run against production the morning of.
5. **Schedule**: announce in #efu-ops "Event goes live in <X> hours". Primary
   on-call (procedure §4.6) takes watch 1 hour before doors.

### 4.2 Pre-event (T-1 hour)

1. Open `/status` in a private window — confirm 200.
2. Open the status page editor (Instatus / Better Uptime).
3. Open `#efu-ops` Slack — confirm the on-call is reachable.
4. Open `/api/get-stream-token` in a test session — confirm 200 and a JWT.
5. Open `/watch` in a private window while logged out — confirm paywall.
6. Open `/watch` in a private window while logged in with an entitled test
   account — confirm player loads.

### 4.3 Going live (T-0)

1. **Producer's side** (the one with OBS):
   - Open OBS, set the scene to the live broadcast feed.
   - Set Server = `rtmps://live.cloudflare.com:443/live/<stream-key>`.
   - Click **Start Streaming** in OBS. The Cloudflare Stream dashboard
     should show the Live Input as "Live" within 5 seconds.
2. **Operator side** (the one on `#efu-ops`):
   - Watch `/status` and the Vercel function metrics — error rate must stay
     < 0.5 %.
   - Watch Stripe dashboard — `payment_intent.succeeded` should tick up
     during the event as new viewers purchase the season pass.
   - Watch the signed-token issuance rate in the log sink — sudden drop
     means the stream token endpoint is broken (Sev1).
3. **First viewer arrives**:
   - Confirm via `/admin/live` (admin dashboard): "live viewers" > 0.
   - Watch for any "playback error" events in Sentry.
   - Update status page: "Live event in progress."

### 4.4 During the event

Update status page on any of:
- A planned intermission ("On intermission, back at HH:MM").
- A Sev1 / Sev2 that affects viewers.
- The event's end ("Event ended, replay available within 24h").

Update cadence:
- Sev1: status-page update within 5 minutes.
- Sev2: within 15 minutes.
- All clear: within 15 minutes of mitigation.

### 4.5 Post-event (T+30 minutes)

1. **End the broadcast**: producer clicks **Stop Streaming** in OBS.
2. Confirm Cloudflare Stream dashboard shows the Live Input as "Idle".
3. Wait for VOD processing — Cloudflare Stream produces a VOD copy within
   ~30 minutes; the URL is shown on the Live Input's detail page.
4. VOD is automatically listed on the `/replay` page once it appears in the
   `stream_recordings` table (the app polls CF Stream every 15 minutes; or
   manually trigger via the admin "Refresh VODs" button if L6 ships it).
5. Update status page: "Event ended, replay available."
6. Open the operations log in `03-oncall-rotation.md` §8 with the event
   summary, peak concurrent viewer count, payment count, and any incidents.

### 4.6 Role assignments per event

| Role | Who | Tasks |
|---|---|---|
| Producer | External (broadcast crew) | OBS, RTMPS push |
| Operator (in-app) | Internal staff (assigned in `03-oncall-rotation.md` for the event week) | Stripe lookups, manual DB edits, answering viewer emails |
| On-call (engineering) | Rotation's primary | Sev1 mitigation, rollback authority |
| Communicator | Eng Lead or designate | Status-page updates, social-media pause |

The communicator is the only person allowed to post to social channels during
a live event unless pre-approved otherwise.

### 4.7 Troubleshooting cheat sheet

| Symptom | First action |
|---|---|
| Players stuck on loading | Check `/api/get-stream-token` returns a non-empty JWT. If yes, the issue is in CF Stream — pull the Vercel function logs for `get-stream-token` errors. |
| Stripe webhook queue growing | Check `/api/webhooks/stripe` returns 200 within 5 s; if not, scale Vercel function concurrency or restart the function via `vercel deploy --prod` (re-publishes envs and warms the cold start). |
| DB connection refused from Vercel | Confirm `DATABASE_URL` is the **pooled** endpoint (port 6543), not the direct one (port 5432). The pooled one survives serverless cold starts. |
| Live viewers dropping to 0 | Cloudflare Stream — confirm the Live Input is still listed as "Live". If not, the producer's OBS dropped; check that side first. |
| DDoS pattern (log noise + slow responses) | Cloudflare security level → "High", enable Bot Fight Mode if not on. Re-run smoke within 30 minutes. |
