import { NextResponse } from 'next/server';

// Public, unauthenticated health endpoint.
// Returns 200 if the app itself is alive and reachable. It does NOT check
// downstream services (DB / Stripe / Cloudflare) because doing so would
// couple the status page to those upstreams' availability — see
// docs/handoff/05-status-page.md for the layered design.
//
// Cache: 30s edge cache so cheap monitors / cron checkers don't hammer us.
// Use Cloudflare page rule to ALSO cache this at the CDN if desired.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BUILD_SHA = process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev';
const BUILD_TIME = process.env.VERCEL_GIT_COMMIT_DATE ?? new Date().toISOString();
const ENV = process.env.VERCEL_ENV ?? 'local';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'mma-stream',
      version: '1.0.0',
      env: ENV,
      build: { sha: BUILD_SHA, time: BUILD_TIME },
      now: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=30',
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
}
