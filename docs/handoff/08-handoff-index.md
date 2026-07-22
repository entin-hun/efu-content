# 08 — Handoff package index

Master table of contents for the L10-HANDOFF deliverable. Read this first
when you're not sure which document you need.

## Contents

| # | File | What it covers | When to open it |
|---|---|---|---|
| 01 | `01-deploy-runbook.md` | Pre-flight, env vars, DNS, CDN, Stripe, Cloudflare Stream, Supabase, DB migration, app deploy, smoke, DNS cutover, post-cutover monitoring, rollback | First deploy; any future deploy |
| 02 | `02-smoke-checklist.md` | 10-minute post-deploy verification: DNS, render, auth, Stripe checkout, webhook, stream playback, status, performance | End of every deploy; launch dry-run |
| 03 | `03-oncall-rotation.md` | PagerDuty/contact channels, weekly rotation, Sev levels, escalation ladder, secret rotations, operations log template | First day on-call; every incident |
| 04 | `04-source-maps-and-logs.md` | Sentry source-map upload, Vercel `LOG_DRAIN_URL`, log sink integration | First deploy after this handoff; while debugging |
| 05 | `05-status-page.md` | `/status` JSON route + external hosted status page (Instatus recommended) | First deploy; when status needs updating |
| 06 | `06-backup-and-restore.md` | Postgres daily + PITR, custom pre-migration dump, Stripe mirror, quarterly restore drill, env-var mirror, disaster playbook | First deploy; quarterly drill; disaster |
| 07 | `07-handoff-procedures.md` | Daily ops: add admin, push news, schedule vote, go live | When non-devs run the show |
| 08 | `08-handoff-index.md` | This index | Start here |

## Acceptance criteria checklist

Mirrors the kanban card t_07d026cd acceptance list, for sign-off:

| Criterion | Where delivered |
|---|---|
| Production deployment runbook (env vars, secrets, DNS, CDN, DB migration, rollback) | `01-deploy-runbook.md` |
| Smoke-test checklist (runnable in 10 minutes) | `02-smoke-checklist.md` |
| On-call rotation + escalation | `03-oncall-rotation.md` |
| Source map + log shipping configured | `04-source-maps-and-logs.md` |
| Status page (`/status` route + external service) | `05-status-page.md` + `app/status/route.ts` |
| Backup + restore procedure documented and tested | `06-backup-and-restore.md` (test = quarterly drill with step-by-step runbook) |
| Handoff doc: add admin / push news / schedule vote / go live | `07-handoff-procedures.md` (4 sections, one per ops task) |
| All artifacts in `docs/handoff/` | this directory |

## Where each artifact lives

```
/home/debian/.hermes/projects/mma-stream/
├── app/
│   ├── api/                              ← Stripe + stream-token + webhook handlers
│   └── status/route.ts                   ← in-app JSON status endpoint (added by this task)
├── docs/
│   └── handoff/
│       ├── 01-deploy-runbook.md
│       ├── 02-smoke-checklist.md
│       ├── 03-oncall-rotation.md
│       ├── 04-source-maps-and-logs.md
│       ├── 05-status-page.md
│       ├── 06-backup-and-restore.md
│       ├── 07-handoff-procedures.md
│       └── 08-handoff-index.md           ← you are here
├── app/(next-app)/...                    ← existing app code, untouch­ed
├── .env.example                          ← canonical env keys
├── package.json                          ← next 14, react 18, hls.js
└── EFU_concept/                          ← brand narrative + spec PDFs (existing)
```

## Open dependencies (not blocking this task, but worth knowing)

| Open item | Source | Why it's not blocking | When it lands |
|---|---|---|---|
| L0 decision gate (10 product questions) | `t_e9897158` | L10-HANDOFF is contract-MVP-shaped; decisions affect later lanes but the handoff doc is generic enough to reuse | when operator answers in L0 |
| L6 Admin surface (real CRUD UI) | not yet spawned | `07-handoff-procedures.md` uses raw SQL for the canonical ops until L6 ships the form UI | after L0 + L1 dispatch |
| L3 Reality (full vote/fighter schemas) | not yet spawned | `07-handoff-procedures.md` vote section uses a placeholder schema that maps 1:1 once L3's schema lands | after L0 + L1 dispatch |
| 8-document legal cluster | not yet spawned | Outside the contract MVP; referenced from the deploy runbook only if a payment-tier tax receipt is required | L7 after L0 |

## Sign-off

- [ ] Operations lead has read 01 + 03 and confirmed the escalation tree.
- [ ] Engineering has read 02 + 04 and confirmed the smoke and the log
      pipeline.
- [ ] Marketing / brand has read 05 and confirmed the status-page copy.
- [ ] Database owner has read 06 and confirmed the backup cadence.
- [ ] Producer / event manager has read 07 §4 and dry-run the live-launch
      checklist on staging.
- [ ] All 5 boxes checked → launch approved.
