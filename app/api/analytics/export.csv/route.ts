import { NextRequest, NextResponse } from 'next/server';
import { readEvents } from '@/lib/analytics/store';
import { summarize, toCsv } from '@/lib/analytics/aggregate';

const PRESETS: Record<string, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

function parseRange(url: URL) {
  const preset = url.searchParams.get('range') ?? '7d';
  let sinceMs: number;
  const untilMs = Number(url.searchParams.get('until')) || Date.now();
  if (preset === 'custom') {
    const sinceParam = Number(url.searchParams.get('since'));
    sinceMs = sinceParam || untilMs - 7 * 24 * 60 * 60 * 1000;
  } else {
    const span = PRESETS[preset] ?? PRESETS['7d'];
    sinceMs = untilMs - span;
  }
  return { sinceMs, untilMs };
}

/**
 * GET /api/analytics/export.csv?range=7d
 *
 * Streams a CSV with one row per metric. Same source as /summary.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const range = parseRange(new URL(request.url));
  const events = await readEvents();
  const summary = summarize(events, range);
  const csv = toCsv(summary);
  const filename = `efu-analytics_${range.sinceMs}_${range.untilMs}.csv`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
