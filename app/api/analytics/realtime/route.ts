import { NextRequest, NextResponse } from 'next/server';
import { snapshot, recordViewer, dropViewer } from '@/lib/analytics/realtime';
import { trackEvent } from '@/lib/analytics/store';

/**
 * GET  /api/analytics/realtime?stream=...   -> snapshot
 * POST /api/analytics/realtime              -> heartbeat / leave
 *   { streamId, sessionId, action: 'join' | 'leave' }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const streamId = url.searchParams.get('stream') ?? 'fight_night_jul17';
  const snap = snapshot(streamId);
  return NextResponse.json(snap);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const streamId = body.streamId ?? 'fight_night_jul17';
  const sessionId = body.sessionId ?? `s-${Math.random().toString(36).slice(2, 10)}`;
  const action = body.action ?? 'join';

  if (action === 'leave') {
    const concurrent = dropViewer(streamId, sessionId);
    await trackEvent({
      category: 'viewership',
      kind: 'session_end',
      streamId,
      viewerMinutes: body.viewerMinutes,
    });
    return NextResponse.json({ streamId, concurrent });
  }
  // default: join / heartbeat
  const concurrent = recordViewer(streamId, sessionId);
  await trackEvent({
    category: 'viewership',
    kind: 'heartbeat',
    streamId,
    userId: sessionId,
    concurrent,
  });
  // synthesize a small chat/vote rate proportional to concurrent viewers
  const chatRate = Math.floor(concurrent * (0.1 + Math.random() * 0.4));
  const voteRate = Math.max(1, Math.floor(concurrent * (0.02 + Math.random() * 0.1)));
  return NextResponse.json({ streamId, concurrent, chatRate, voteRate });
}
