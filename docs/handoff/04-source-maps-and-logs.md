# 04 — Source maps & log shipping

Goal: when something breaks in production, the on-call can find the offending
line of original source code (not the minified bundle), and can grep through
the runtime logs without SSH-ing into a server. Two pieces:

1. **Source maps** — make stack traces readable.
2. **Log shipping** — collect Next.js + Stripe-webhook + Cloudflare-Stream
   events to one searchable sink.

## 1. Source maps

Source maps are uploaded to **Sentry** (recommended) or **Bugsnag**. The
contracts in the runbook (§2) do not include Sentry, but this section assumes
you have a Sentry project set up. If you do not, treat the Sentry steps as
optional and keep source maps local (built-in `productionBrowserSourceMaps:
true` in `next.config.js`).

### 1.1 Enable source-map upload in `next.config.js`

Sentry's Next.js SDK reads the build output and uploads maps during `next
build`. The minimal config:

```js
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // your existing next config
  reactStrictMode: true,
}, {
  // Sentry SDK options — minimum to ship maps
  org: 'efu',
  project: 'mma-stream',
  authToken: process.env.SENTRY_AUTH_TOKEN,        // local-only env
  silent: true,
  widenClientFileUpload: true,                    // upload client maps too
  hideSourceMaps: true,                           // keep maps out of /.next
  disableLogger: false,
}, {
  // App-level options
  dryRun: false,
  sentryUrl: 'https://sentry.io/',
});
```

### 1.2 Build-time env

```bash
# Locally only — never set in Vercel production env
export SENTRY_AUTH_TOKEN=sntrys_...

# Vercel build-time env (set this in Vercel UI, not env)
#   - key:   SENTRY_AUTH_TOKEN
#   - value: <token with project:releases scope>
```

The token is created in Sentry → Settings → API → Tokens. **Do not** use the
DSN — it does not have upload permission.

### 1.3 What you should see in Sentry

After a deploy:

- A new **Release** appears in Sentry → Releases, named `mma-stream@<git-sha>`.
- The release's **Artifacts** tab lists source maps for both server and
  client bundles.
- Opening an error report and clicking on a stack frame deep-links to the
  original `.tsx` / `.ts` file (not the minified `.js`).

If any of those three things are missing, source-map upload failed. Run
`vercel logs --prod | grep sentry-cli` to see what went wrong. Common
causes:

- `SENTRY_AUTH_TOKEN` not set on the Vercel build.
- Token missing `project:releases` scope.
- Network: Vercel build cannot reach `*.sentry.io`. Add an allowlist or use
  the EU data region (`https://de.sentry.io`).

## 2. Log shipping

There is no single right tool. Pick one:

| Tool | Cost | EU residency | Notes |
|---|---|---|---|
| **Better Stack** | free under 5 GB/mo | yes (Frankfurt) | recommended for v1.0 |
| **Logflare** | free under 1 GB/mo | yes | good if you already use Supabase |
| **Datadog Logs** | paid | yes | pick if you're already in Datadog |
| **Axiom** | cheap | yes | good Next.js story |

The next.config.js below is tool-agnostic — replace `LOG_DRAIN_URL` with the
endpoint from whichever tool you pick.

### 2.1 Vercel → log drain

Vercel supports a single `LOG_DRAIN_URL` env (per environment) that gets
JSON-formatted log lines for every function invocation, build log, and edge
event. The destination interprets `LOG_DRAIN_URL` as an HTTPS endpoint and
ingests each line as one event.

Steps (using Better Stack as the example):

1. Create a source in Better Stack (or your tool) — copy the HTTPS endpoint.
   Shape: `https://in.logs.betterstack.com/<token>`.
2. Set `LOG_DRAIN_URL` in Vercel project env (Production).
3. In Better Stack, define the parser as **JSON with these expected keys**:
   - `timestamp`
   - `level` (info/warn/error)
   - `message`
   - `requestId`
   - `path`
   - `statusCode`

### 2.2 Default Next.js logging

In `next.config.js`, lower the log threshold to include warnings in
production:

```js
module.exports = {
  experimental: { instrumentationHook: true },
  // …
};
```

Then in `instrumentation.ts` (project root):

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('./lib/logger');
    logger.info('app boot', { env: process.env.VERCEL_ENV });
  }
}
```

`./lib/logger` is a thin pino wrapper that writes structured JSON to stdout;
Vercel drains stdout to `LOG_DRAIN_URL`.

### 2.3 Stripe webhook → correlated logs

The `/api/webhooks/stripe` route should emit a log line with the
`stripe-signature` header and the resolved `event.id`. This is what makes the
canonical smoke check ("did the webhook arrive?") a one-grep check.

```ts
// app/api/webhooks/stripe/route.ts (pseudocode)
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') ?? '<missing>';
  const event = await verifyAndParse(req, sig);
  console.log(JSON.stringify({
    level: 'info',
    message: 'stripe webhook',
    eventId: event.id,
    eventType: event.type,
    sig: sig.slice(0, 16) + '…',
  }));
  // …
}
```

### 2.4 Cloudflare Stream → log drain (optional)

If you are not on a paid Cloudflare plan, you cannot drain Stream logs to an
external sink; rely on the Stream dashboard instead. On the paid plan, set up
Logpush to point at the same JSON sink — see Cloudflare's docs.

### 2.5 Verifying logs land

After the first deploy with the drain configured:

1. Visit any page in production.
2. In your log sink, search for a `requestId` that you see in DevTools →
   Network → response headers (`x-vercel-id`).
3. The result should have at minimum: the request line, the function name,
   and the status code.

If nothing shows up:

- Confirm `LOG_DRAIN_URL` is set in Vercel prod env (it is **separate** from
  the preview/staging envs).
- Confirm the destination allows Vercel's egress IPs.
- Confirm the destination's HTTPS cert is valid (Vercel requires it).

## 3. Putting it together

When an alert fires (e.g. error rate > 1% for 5 min):

1. Open Sentry → Issues. Look for a release-regression (errors that didn't
   happen on the previous release).
2. Open the suspect error → click a frame → confirm the file/line is from
   the original source, not the bundle.
3. Open the log sink → filter by the `requestId` from the issue's breadcrumb
   → walk the timeline of what happened.
4. Decide: hotfix or rollback. Either way, log the incident in
   `03-oncall-rotation.md` §8.
