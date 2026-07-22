import { NextRequest, NextResponse } from 'next/server';
import { readEvents, resetEvents } from '@/lib/analytics/store';
import { summarize } from '@/lib/analytics/aggregate';
import { seedDemoEvents } from '@/lib/analytics/seed';

const PRESETS: Record<string, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

function parseRange(url: URL): { sinceMs: number; untilMs: number } {
  const preset = url.searchParams.get('range') ?? '7d';
  let sinceMs: number;
  let untilMs = Number(url.searchParams.get('until')) || Date.now();
  if (preset === 'custom') {
    const sinceParam = Number(url.searchParams.get('since'));
    const untilParam = Number(url.searchParams.get('until'));
    sinceMs = sinceParam || untilMs - 7 * 24 * 60 * 60 * 1000;
    untilMs = untilParam || Date.now();
  } else {
    const span = PRESETS[preset] ?? PRESETS['7d'];
    sinceMs = untilMs - span;
  }
  return { sinceMs, untilMs };
}

/**
 * GET /api/analytics/summary?range=7d|custom&since&until
 * POST /api/analytics/summary  -> { action: 'seed' | 'reset' }
 *
 * Aggregated metrics for the dashboard.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const range = parseRange(new URL(request.url));
  const events = await readEvents();
  const summary = summarize(events, range);
  return NextResponse.json(summary);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  if (body.action === 'seed') {
    const n = await seedDemoEvents();
    return NextResponse.json({ seeded: n });
  }
  if (body.action === 'reset') {
    await resetEvents();
    return NextResponse.json({ reset: true });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
