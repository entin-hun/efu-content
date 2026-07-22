# 01 — Production Deployment Runbook

Scope: take the `mma-stream` Next.js 14 app from a clean Git checkout to a live
production deployment that can serve paid subscribers watching the EFU live
stream. This is the L10 handoff runbook — write-once, follow-every-deploy.

> **Read first.** Before you start the deploy, read the smoke checklist
> (`02-smoke-checklist.md`) and the rollback section at the bottom of this
> document. You may need to roll back inside 10 minutes if smoke fails.

## 0. Topology at a glance

```
                   ┌──────────────────────┐
   viewer ─────────►  Cloudflare (DNS+CDN) │
                   │  └─ /            ─► Vercel (Next.js)        │ 
                   │  └─ /api/*      ─► Vercel (Next.js)        │
                   │  └─ /watch      ─► Vercel (Next.js)        │
                   │  └─ /status     ─► Vercel (public JSON)    │
                   └──────────────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │ Supabase Postgres    │   ← realtime, auth, RBAC
                  │  - public schema     │
                  │  - auth.users        │
                  └──────────────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │ Stripe (Checkout,    │   ← webhook → /api/webhooks/stripe
                  │ Webhooks, Customer)  │
                  └──────────────────────┘

   OBS / Restream ─► Cloudflare Stream (Live Input)
                              │
                              └─ signed token issued by
                                 /api/get-stream-token on Vercel
```

## 1. Pre-flight (do this 24h before launch)

| # | Check | Owner | Done |
|---|-------|-------|------|
| 1.1 | Confirm Cloudflare zone for the production domain (e.g. `stream.elitefightuniverse.hu`) is added to the operator's Cloudflare account. | ops | ☐ |
| 1.2 | Confirm Vercel team and project created (`efu-stream-prod`). Add a second maintainer so the on-call is never a single point of failure. | ops | ☐ |
| 1.3 | Confirm Supabase project created in EU region (Frankfurt recommended for HU traffic). Save the **project URL** and three keys (anon, service role, database connection string) to the password vault. | ops | ☐ |
| 1.4 | Confirm Stripe live account, products, and webhook endpoints (see §3.3). | ops + finance | ☐ |
| 1.5 | Confirm Cloudflare Stream account + Live Input ID + signing key pair (one key per environment: dev/stage/prod). | ops | ☐ |
| 1.6 | Confirm DNS access (registrar) — to flip the apex and `www` to Cloudflare nameservers. | ops | ☐ |
| 1.7 | Confirm at least 2 operators in the password vault and on the on-call rotation (`03-oncall-rotation.md`). | ops | ☐ |
| 1.8 | Run the backup-restore drill from `06-backup-and-restore.md` against staging. | on-call | ☐ |

## 2. Environment variables

All production secrets live in **Vercel project → Settings → Environment
Variables**, scoped to **Production**. They are never committed to Git.

| Name | Where it goes | Source of truth | Rotation cadence |
|---|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | Vercel env (prod) | the production domain, https:// | on domain change |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel env (prod) | Supabase dashboard → Settings → API | on project re-issue |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel env (prod) | Supabase dashboard → Settings → API | on project re-issue |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (prod + webhooks) | Supabase dashboard → Settings → API | on operator change; **rotates strictly ≥ 48h after the previous key is deleted** to avoid race window during deploys |
| `DATABASE_URL` | Vercel env (prod) | Supabase dashboard → Settings → Database → Connection string (use the **pooled** one for serverless) | on password reset |
| `STRIPE_SECRET_KEY` | Vercel env (prod) | Stripe dashboard → Developers → API keys (live) | on operator change |
| `STRIPE_PUBLISHABLE_KEY` | Vercel env (prod) | Stripe dashboard → Developers → API keys (live) | on key rotate |
| `STRIPE_PRICE_ID` | Vercel env (prod) | Stripe dashboard → Products → the szezonberlet product's price id | on price change |
| `STRIPE_WEBHOOK_SECRET` | Vercel env (prod) | shown at webhook creation (`whsec_…`) | on endpoint re-create |
| `CF_ACCOUNT_ID` | Vercel env (prod) | Cloudflare dashboard → Stream → Account ID | n/a |
| `CF_STREAM_ID` | Vercel env (prod) | Cloudflare Stream → the Live Input ID | on Live Input change |
| `CF_STREAM_KEY_ID` | Vercel env (prod) | Cloudflare Stream → Signing keys | on key rotate |
| `CF_STREAM_PRIVATE_KEY` | Vercel env (prod) | paired RSA private key (PEM); **paste the base64 contents**, do NOT paste a multi-line PEM (Vercel envs are single-line) | on key rotate (≤ 90 days recommended) |
| `LOG_DRAIN_URL` (optional) | Vercel env (prod) | from your log sink (Better Stack / Datadog / Logflare) — see `04-source-maps-and-logs.md` | on sink change |
| `SENTRY_DSN` (optional) | Vercel env (prod) | Sentry project settings | on project re-issue |

### 2.1 Secret-loading commands

```bash
# Pull existing prod envs into a local CSV for audit:
vercel env pull .env.production --environment=production --yes

# Set one-off (use --sensitive so it isn't echoed):
echo "<value>" | vercel env add STRIPE_SECRET_KEY production --sensitive

# Audit who last touched the env (Vercel does not expose this — keep a
# operations log in 03-oncall-rotation.md, the "Secret rotations" table).
```

### 2.2 The "never commit" list

`.env*`, `*.pem`, `*.key`, `secrets/`, and any Stripe / Cloudflare / Supabase
keys must stay out of Git. `.gitignore` is checked in: confirm with

```bash
git check-ignore -v .env.production .env.local 'secrets/*.pem'
```

If any are NOT ignored, **stop the deploy** and fix the `.gitignore` first.

## 3. External services

### 3.1 DNS

| Record | Type | Value | Proxy | Notes |
|---|---|---|---|---|
| `stream.elitefightuniverse.hu` | A or CNAME | the Vercel-provisioned apex target | Proxied through Cloudflare | Apex sits behind Cloudflare for caching + WAF |
| `www.stream.…` | CNAME | apex | Proxied | |
| `_vercel` (TXT) | TXT | the Vercel domain-verification value | n/a | Required once before DNS will resolve |

In the Cloudflare dashboard, set SSL/TLS to **Full (strict)** and enable
**Always Use HTTPS**, **HTTP/3 (QUIC)**, and **Auto Minify** for HTML/CSS/JS.
Enable **Bot Fight Mode** only after the first day of production traffic — false
positives are easier to diagnose when Bot Fight is off.

### 3.2 CDN

Cloudflare sits in front of Vercel as the CDN. Two cache rules:

1. **Static assets** (`/_next/static/*`, `/favicon.ico`, images in `/public`):
   Cache level = `Cache Everything`, Edge TTL = 1 year, Browser TTL = 1 year.
2. **HTML pages**: Bypass cache. Next.js sets the right `Cache-Control` based
   on the route; do not override at the Cloudflare layer.

Worker is **not** required for V1.0. Add a Worker only if you need to
geo-fence payments or rewrite Stripe redirect URLs.

### 3.3 Stripe

1. Switch the Stripe dashboard to **Live mode** (toggle top-left).
2. Create a single product: `EFU Szezonbérlet` with one recurring or one-time
   price of **2500 HUF**.
3. Copy the price id (`price_…`) into `STRIPE_PRICE_ID`.
4. Create one webhook endpoint:
   - URL: `https://<prod-host>/api/webhooks/stripe`
   - Events to send: `checkout.session.completed`, `payment_intent.succeeded`,
     `payment_intent.payment_failed`, `charge.refunded`,
     `customer.subscription.deleted` (only if subscription model is used).
   - Copy the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.
5. Test once with the Stripe CLI before launch:

   ```bash
   stripe listen --forward-to https://<prod-host>/api/webhooks/stripe
   # in another shell:
   stripe trigger checkout.session.completed
   ```

### 3.4 Cloudflare Stream

1. In Cloudflare Stream → **Live Inputs** → create one Live Input per
   production stream (a typical MMA event needs 1–2; the second one is the
   backup).
2. Copy each Live Input's UID into `CF_STREAM_ID` (single-stream deployments)
   or store them in a JSON file under Cloudflare Workers KV if you have many.
3. Stream → **Signing keys** → create one RS256 key. Two values come out:
   - `key id` (e.g. `abc123…`) → `CF_STREAM_KEY_ID`
   - the RSA private key (PEM) → base64-encode the multi-line PEM, then
     paste the single-line base64 into `CF_STREAM_PRIVATE_KEY`. The code in
     `app/api/get-stream-token/route.ts` decodes it before signing.
4. On the Live Input, toggle **Require Signed URLs**. Unprotected playback
   should now 403.

### 3.5 Supabase (Postgres + Auth)

1. Create the project in EU region (Frankfurt).
2. In Settings → Database, copy the **pooled** connection string (port 6543)
   into `DATABASE_URL`. Prisma / Drizzle / raw SQL clients talk to that.
3. Enable **Email + Google** auth providers if those are the chosen login
   methods (this is one of L0's open questions; default to Email + Google for
   launch, expand to Apple/Facebook afterwards).
4. Set the Site URL to the production domain and the redirect URLs to:
   - `https://<prod-host>/`
   - `https://<prod-host>/api/auth/callback` (NextAuth) or the Supabase
     callback URL if you are using Supabase Auth directly.
5. Apply all migrations (see §4).

## 4. Database migration

### 4.1 Migration tooling

The project ships migrations as plain SQL in `db/migrations/`, named
`NNNNNN_description.sql` (the timestamp is `YYYYMMDDHHMM`). Apply them with
the Supabase CLI:

```bash
# 1. Authenticate
supabase login

# 2. Link the project (saved under .supabase/ locally)
supabase link --project-ref <project-ref>

# 3. Dry-run (print SQL, do not apply)
supabase db push --dry-run --include-all

# 4. Apply
supabase db push --include-all
```

### 4.2 Pre-migration checklist

- [ ] Last backup verified (see `06-backup-and-restore.md`)
- [ ] Maintenance window announced to the operators (if expected downtime > 30s)
- [ ] Migration is **forward-compatible** with the current app version
      (i.e. the current app code still works even before the migration lands)
- [ ] At least one peer reviewer has signed off on the migration SQL

### 4.3 Post-migration

```bash
# Confirm schema version
psql "$DATABASE_URL" -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 5;"

# Confirm critical tables exist (the names are decided in L4; placeholder
# names below — replace with the real ones once L4 lands):
psql "$DATABASE_URL" -c "\dt" | grep -E "users|seasons|tickets|votes|articles|reality_triggers"
```

If any expected table is missing, **stop the deploy** and investigate.

## 5. Application deploy

```bash
# 1. From a clean main branch
git checkout main
git pull --ff-only

# 2. Confirm Vercel project is linked
vercel link --yes

# 3. Deploy to production (this is a real deploy, not a preview)
vercel deploy --prod

# 4. Capture the deploy URL (printed by Vercel) and run the smoke checklist.
```

If the repo is small enough that Vercel builds the entire app in < 60 s, you
can skip the explicit preview-build step. If it's larger, run a preview first:

```bash
vercel deploy           # preview URL
# open it, run smoke subset from 02-smoke-checklist.md
# if green:
vercel deploy --prod    # promote
```

## 6. Smoke + sign-off

Walk through `02-smoke-checklist.md` end to end. Both on-calls must sign off
in the operations log before you flip DNS.

## 7. DNS cutover

Only after smoke passes:

1. Lower the Cloudflare proxy (grey-cloud) for **5 minutes** while DNS
   propagates, then re-enable (orange-cloud) once you see the green Vercel
   certificate.
2. Watch the runbook's "Domain resolution" step in §6 of the smoke checklist
   to confirm the apex and `www` resolve to the Vercel anycast IPs.
3. Update the Apex redirect so `https://elitefightuniverse.hu` (the marketing
   domain) issues a 301 to `https://stream.elitefightuniverse.hu`. Do this
   with a Cloudflare Page Rule.

## 8. Post-cutover monitoring (first 24h)

- Watch the Vercel function metrics (p95 latency, error rate) every hour.
- Watch the Stripe dashboard for any payment_intent.payment_failed spikes.
- Watch the Cloudflare Stream dashboard for delivery errors / 5xx responses.
- Confirm log shipping is receiving events (see `04-source-maps-and-logs.md`).
- Confirm source maps uploaded on the first error report (same doc).

If any of these misbehave, jump to the **rollback** section.

## 9. Rollback

Two rollback depths:

### 9.1 App rollback (Vercel)

```bash
# List recent deployments
vercel ls --prod

# Roll back to the previous successful deploy
vercel rollback <previous-deploy-url>
```

Effects:
- All traffic returns to the previous app version.
- Database schema is NOT rolled back (see §9.2).
- Env vars remain (good — rollback shares envs).

### 9.2 Database rollback

Only do this if the migration itself was the cause of the incident.

```bash
# 1. Pause app traffic
vercel env add MAINTENANCE_MODE true production --sensitive

# 2. Restore from the pre-migration backup
psql "$DATABASE_URL" < backups/pre-migration-<timestamp>.sql

# 3. Re-deploy the previous app code
vercel rollback <previous-deploy-url>

# 4. Once green, remove MAINTENANCE_MODE
vercel env rm MAINTENANCE_MODE production --yes

# 5. Open a post-mortem (see 03-oncall-rotation.md, "Incident" sections).
```

### 9.3 CDN / DNS rollback

If the cutover itself is the cause, revert Cloudflare DNS records to the
pre-deploy values (the **1.1** step captured the previous values). TTL is
typically 5–60 minutes depending on the original record.

### 9.4 When rollback is not enough

If the incident is in a third-party service (Cloudflare outage, Stripe outage),
do NOT roll back the app — record the event and wait for upstream recovery.
Paging the on-call's **secondary** is appropriate here; both should be on
the call within 15 minutes of a true outage declaration.
