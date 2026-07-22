import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics/store';
import type { AnalyticsEvent } from '@/lib/analytics/types';

const ALLOWED_CATEGORIES = new Set([
  'visitor',
  'activity',
  'subscription',
  'viewership',
  'vote',
  'interaction',
]);

function isAnalyticsEvent(obj: unknown): obj is AnalyticsEvent {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.category !== 'string' || !ALLOWED_CATEGORIES.has(o.category)) return false;
  if (typeof o.kind !== 'string') return false;
  return true;
}

/**
 * POST /api/analytics/track
 *
 * Accepts a single AnalyticsEvent (or array) and stores it.
 * Used by the client-side `lib/analytics/client.ts` helpers.
 *
 * In production this would also be the place to enforce auth (e.g. only
 * authenticated user actions may write), but the dashboard currently
 * tracks from anonymous visitors too, so the route stays open.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const list = Array.isArray(body) ? body : [body];
  let stored = 0;
  for (const item of list) {
    if (!isAnalyticsEvent(item)) continue;
    await trackEvent(item);
    stored += 1;
  }
  return NextResponse.json({ received: stored });
}
