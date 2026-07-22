tool: Skill: handle_complex_task
arguments:
  input: # 03 — On-call rotation & escalation

Goal: define who gets paged when the production environment breaks, how they
escalate, and how the operations log is kept. This is the boring stuff that
saves the show when things go wrong at 11pm the night of an event.

> **Print this page.** In a real incident you will not have time to scroll.

## 1. Contact channels

| Channel | Purpose | Where it lives |
|---|---|---|
| **PagerDuty** (or alternative — see §6) | Primary paging | https://efu.pagerduty.com |
| **#efu-ops** Slack | War-room chat | Slack workspace, channel `efu-ops` |
| **+36-…** phone (primary on-call) | Voice fallback for Sev1 | operator's personal phone |
| **Status page** (see `05-status-page.md`) | Public-facing incident status | `https://status.stream.elitefightuniverse.hu` |
| **Operations log** | Append-only record | The bottom of this file (`§8`) |

## 2. Rotation

> Replace the placeholder names with the actual operators. The roles are real.

| Week (ISO) | Primary on-call | Secondary on-call | Manager (escalation) |
|---|---|---|---|
| 2026-W27 | Operator A | Operator B | Eng Lead C |
| 2026-W28 | Operator B | Operator A | Eng Lead C |
| ... | ... | ... | ... |

The shift changes at **Monday 09:00 Europe/Budapest**. The handoff is a
15-minute call: incoming on-call reads the previous week's incident entries in
the operations log (`§8`), then takes over the PagerDuty schedule.

## 3. Severity levels

| Sev | Definition | First response | Resolution target |
|---|---|---|---|
| **Sev1 — Live site down or payments broken** | Production site 5xx > 50% of traffic OR Stripe checkout failing for paying users. **Live event in progress counts as Sev1 regardless of %**. | 5 min ack, 15 min mitigation | 2 hours |
| **Sev2 — Major degradation** | Some users can't pay or play, but site is up; or a security finding. | 15 min ack, 1 hour mitigation | 8 hours |
| **Sev3 — Minor degradation** | Cosmetic bug, single page broken, no financial impact. | 1 hour ack | next business day |
| **Sev4 — Internal-only** | Logs noisy, internal tooling broken, scheduled maintenance. | best effort | best effort |

## 4. Escalation path

```
                        Sev1: 5 min
                       ┌──────────────────►  Primary on-call
   Alert fires ────────┤                       │
                       │                       │  acked?
                       │                       │   no  (5 min)
                       │                       ▼
                       │                  Secondary on-call
                       │                       │
                       │                       │  acked? (5 min)
                       │                       │   no
                       │                       ▼
                       └──────────────────►  Manager (Eng Lead)
                                                  │
                                                  │  acked? (5 min)
                                                  │   no
                                                  ▼
                                          Director / MD
                                          (pause event marketing,
                                           customer comms decisions)
```

For **Sev2+**, the same ladder applies but the first timer is 15 min instead
of 5.

For **Sev1 during a live event**, the manager is paged in parallel with the
secondary on-call — do not wait.

## 5. What to do when paged

1. **Acknowledge in PagerDuty** (or ack channel if no PagerDuty).
2. **Open #efu-ops war room** in Slack. Even if no one else is there yet, the
   thread becomes the auto-record.
3. State the symptom in one line:
   `"Sev2 — /api/checkout timing out: p95 8s, last 10 min"`
4. Capture the deploy id (Vercel), any recent config change, and a curl
   repro that fails.
5. Either fix forward or roll back per `01-deploy-runbook.md` §9.
6. At all times, **someone in the war room is responsible for status-page
   updates** (see `05-status-page.md`) — do not let the public status go stale.
7. After mitigation, open an incident entry in the operations log (`§8`)
   with: severity, start time, detect time, mitigation time, root cause (one
   sentence), and follow-ups.

## 6. Paging tool options

The runbook assumes PagerDuty, but any equivalent works:

- **PagerDuty** (paid) — default recommendation.
- **OpsGenie** — comparable.
- **Grafana Alerting → email/SMS** — cheap fallback; pair with the Slack
  war-room channel above.
- **No external tool** — feasible for an event-only site. Replace the
  "acknowledge in PagerDuty" step with a manual phone call to the secondary.
  Document the phone number in the operations log.

If you choose the **no-external-tool** path, the secondary's phone number is a
required item in the rotation table (§2). The primary's number goes on the
password vault, **not** in this file.

## 7. Secret rotations

| Secret | Last rotated | By | Next due |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | _________________ | _________ | 90 days after last |
| `STRIPE_WEBHOOK_SECRET` | _________________ | _________ | on endpoint re-create only |
| `SUPABASE_SERVICE_ROLE_KEY` | _________________ | _________ | on operator change |
| `CF_STREAM_PRIVATE_KEY` | _________________ | _________ | 90 days after last |
| Vercel deploy token (if personal) | _________________ | _________ | on operator change |

> Whenever you rotate a secret, log it here within 1 hour. The on-call's
> job during handoff is to scan this table and surface anything approaching
> its due date.

## 8. Operations log

> Append-only. Add new entries at the bottom. Never edit a past entry; if you
> made a mistake, add a follow-up line that corrects it.

### 2026-07-05 — Initial handoff package published

- Owners: Eng Lead C
- Notes: `docs/handoff/` published, smoke checklist green on staging.
- Action items:
  - Confirm Phone A, Phone B numbers in vault before launch.
  - First event cutover scheduled 2026-08-… (TBD).

```
─────── incident template (copy from here down) ───────

### <YYYY-MM-DD HH:MM> — Sev<1|2|3|4> — <one-line title>
- Detect time:    HH:MM UTC
- Ack time:       HH:MM UTC   (target: Sev1 5m, Sev2 15m, Sev3 1h)
- Mitigation time:HH:MM UTC
- Closed time:    HH:MM UTC
- Channel:        #efu-ops
- Deploy id:      <vercel deploy url or id>
- Symptom:        (one sentence)
- Root cause:     (one sentence — fill in post-mortem)
- Mitigation:     (rollback? hotfix? wait for upstream?)
- Follow-ups:
  - [ ] <owner> — <action>
  - [ ] <owner> — <action>
```
