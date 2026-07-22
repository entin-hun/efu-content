# 06 — Backup & restore

Goal: when the database is corrupt, deleted, or dropped, recover every user
entitlement without losing more than 24 hours of new sign-ups. This is the
single most-skipped production-readiness item and the single most-feared one
the day something goes wrong.

## 1. What gets backed up

| Asset | Tool | Where it lives | Backup target |
|---|---|---|---|
| **Postgres (Supabase)** | Supabase built-in daily + PITR | the Supabase project | S3 bucket + Glacier tier |
| **Stripe data** | Stripe API export (daily) | stripe.com dashboard | S3 bucket (read-only mirror) |
| **Cloudflare Stream recordings** | Cloudflare Stream retention | CF Stream dashboard | storage is in CF, not us |
| **App source** | GitHub `main` branch | already in GitHub | GitHub is the backup |
| **Environment variables** | Manual mirror file | password vault | see §5 |
| **Cloudflare Stream signing keys** | Manual export on rotate | password vault | see §5 |

Everything else (Cloudflare config, Vercel project settings, page rules) is
either reproduced in code (Vercel env, page rules as IaC) or pulled from a
provider dashboard we do not own.

### 1.1 RPO / RTO targets

- **RPO (Recovery Point Objective)** — at most **24 hours** of new writes are
  acceptable to lose. Postgres backups run daily, which meets this.
- **RTO (Recovery Time Objective)** — restore must complete within **2
  hours** end to end (download + import + smoke). Postgres restores are
  smaller than the full DB; a 1 GB DB restores in < 10 minutes on Supabase.

## 2. Postgres backup

### 2.1 Daily backups (already on by default in Supabase Pro)

Confirm in Supabase dashboard → Database → Backups → **Daily backups: ON**.

To enable point-in-time recovery (recommended, ~$100/mo on Pro):

1. Settings → Database → **Point in Time Recovery: ON**, retention 7 days.
2. This lets you restore to an arbitrary minute, not just to the daily
   snapshot boundary.

### 2.2 Custom backup (one-off, before risky migration)

Before any destructive change:

```bash
# One-off logical dump (recommended over relying on Supabase's daily only)
pg_dump "$DATABASE_URL" \
  --no-owner --no-privileges \
  --format=custom \
  --file="db-backups/pre-migration-$(date +%Y%m%d-%H%M%S).dump"

# Verify the dump is non-empty and pg_restore-able:
pg_restore --list db-backups/pre-migration-*.dump | head -5
ls -lh db-backups/
```

### 2.3 Storage of backups

Push to S3 (or any S3-compatible storage the operator already uses):

```bash
# Example using rclone + a configured remote named `ops-backup`:
rclone copy db-backups/ ops-backup:efu-mma-stream/db-backups/ \
  --progress --transfers 4

# Lifecycle policy on the bucket (set once, in Terraform or console):
#   - move to Standard-IA after 30 days
#   - move to Glacier Deep Archive after 90 days
#   - expire after 365 days (Supabase daily backup covers the long tail)
```

Retention matrix:

| Tier | Retention | Cost per GB/mo |
|---|---|---|
| S3 Standard | 30 days | $0.023 |
| S3 Standard-IA | 90 days | $0.0125 |
| Glacier Deep Archive | 365 days | $0.00099 |

The S3 bucket itself is `efu-mma-stream-backups` and lives in the operator's
AWS account (NOT in the EFU Supabase project — separation of concerns).

## 3. Stripe data mirror

Stripe is the system of record for paid entitlements. We mirror once per day.

```bash
# 1. Export customers (for refinding users if our DB is lost)
stripe customers list --limit 100 --api-key "$STRIPE_SECRET_KEY" \
  | jq '[.data[] | {id, email, name, created, subscription: .subscriptions.data[0].id}]' \
  > stripe-mirror/customers-$(date +%Y%m%d).json

# 2. Export subscriptions (active + canceled)
stripe subscriptions list --limit 100 --api-key "$STRIPE_SECRET_KEY" --status all \
  | jq '[.data[] | {id, customer, status, current_period_end, items: .items.data[0].price.id}]' \
  > stripe-mirror/subscriptions-$(date +%Y%m%d).json

# 3. Mirror to S3 (same bucket)
rclone copy stripe-mirror/ ops-backup:efu-mma-stream/stripe-mirror/
```

Even a full DB loss does not lose payment state — Stripe knows everything.
The mirror is just insurance for reconciling.

## 4. Restore drill (must be run at least quarterly)

A backup you have never tested is not a backup. Schedule a **90-minute drill
every quarter** with two operators.

### 4.1 Drill target environment

A second Supabase project (e.g. `efu-stream-dr`) in the same region, with a
fresh empty schema. The drill restores the dump into `efu-stream-dr` and
walks through the smoke checks against it.

### 4.2 The drill steps

```bash
# 1. Pull the latest daily backup from S3
LATEST=$(rclone lsjson ops-backup:efu-mma-stream/db-backups/ --files-only | jq -r 'sort_by(.ModTime) | .[-1].Path')
echo "Restoring from: $LATEST"

rclone copyto "ops-backup:efu-mma-stream/db-backups/$LATEST" /tmp/restore.dump

# 2. Create the drill project (Supabase CLI)
supabase projects create efu-stream-dr --region eu-central-1 --db-password "$DRILL_DB_PW"
supabase link --project-ref <drill-ref>

# 3. Apply migrations FIRST (the dump is schema+data, but we want to verify
#    migrations land cleanly on a fresh DB too)
supabase db push --include-all

# 4. Restore the data dump on top
pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname "$DRILL_DATABASE_URL" /tmp/restore.dump

# 5. Walk the smoke
curl -s https://dr.stream.elitefightuniverse.hu/api/health
# (run the L10-QA smoke subset from 02-smoke-checklist.md against the drill env)

# 6. Tear down
supabase projects delete <drill-ref> --no-confirm
```

### 4.3 Drill outcomes

| Outcome | Action |
|---|---|
| Restore finishes in < 15 min and smoke is green | Document date + duration in §8 of `03-oncall-rotation.md`. Done. |
| Restore finishes but smoke fails on > 1 step | Open a follow-up: investigate, fix, re-run within 7 days |
| Restore fails or hangs | Open a Sev3, do not run it again until the issue is root-caused |

## 5. Env-var mirror (manual, on change)

Any time someone rotates a production secret, mirror it to a dedicated note in
the password vault (1Password / Bitwarden / LastPass teams / HashiCorp Vault —
operator's choice). The note is titled **`EFU Stream — production envs`**
and contains:

- All values from `vercel env ls --environment=production`
- The `STRIPE_SECRET_KEY` (named "Stripe live key, last 4 chars XXXX")
- All `CF_STREAM_*` values
- The Supabase service-role key (encrypted note)
- The CF Stream signing-key PEM (as a file attachment, **not** in the note
  body — paste a base64 version if your vault supports attached files)

The vault entry's "last modified" timestamp is the rotation log. Cross-check
it against the table in `03-oncall-rotation.md` §7 every quarter.

## 6. Disaster playbook

When the database is corrupt or deleted:

1. **On-call declares Sev1**, opens `#efu-ops`, sets the status page to
   "Service down" within 5 minutes.
2. Identify the most recent usable backup:
   - Daily snapshot if the corruption is ≥ 24 h old, else
   - PITR target (closest minute **before** the corruption event).
3. Provision a new Supabase project (or use the dr project, depending on
   blast radius). Apply migrations first.
4. Restore: `pg_restore --clean --if-exists ... db-backups/latest.dump` (for
   daily) or request PITR via Supabase support.
5. Smoke per `02-smoke-checklist.md` A and B only (C/D/E/F can wait).
6. Flip DNS or env to point at the new DB.
7. Re-run full smoke; once green, flip the status page to "Monitoring" then
   "Resolved".
8. Open the post-mortem:
   - `[POST-MORTEM] <YYYY-MM-DD> — DB restore` in the operations log.
   - Five-section format: timeline, root cause, blast radius, remediation
     actions, and prevention (anything we change so this doesn't recur).
   - One follow-up MUST be "test restore in <30 days against the actual
     event".

## 7. What is NOT a backup

These have to be reproducible from code, not "restored from somewhere":

- Cloudflare DNS records — keep them in a Terraform / Cloudflare API export
  on every change (recommended follow-up).
- Vercel env values — keep the manual mirror in §5 above.
- Vercel project settings (build command, output dir, regions) — they are
  the defaults that the project was created with; if Vercel's project state
  is itself lost, recreate the project and `vercel link` from a fresh clone.
- Stripe webhook endpoint — recreate from §3.3 of the deploy runbook; the
  endpoint URL is in code (`app/api/webhooks/stripe`).

The 90-day restore drill covers the **database** path; the rest of the items
above are reproducible from this `docs/handoff/` directory + Git + the
password vault.
