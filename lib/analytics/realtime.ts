/**
 * EFU Analytics — realtime session tracker.
 *
 * Tracks concurrent viewers for live streams via TTL'd session IDs.
 * Heartbeats refresh the TTL; expired sessions drop off automatically.
 *
 * Designed for in-process demo storage; swap for a Redis Set on prod.
 */

const SESSION_TTL_MS = 30_000; // 30 s

declare global {
  // eslint-disable-next-line no-var
  var __EFU_VIEWERS__: Map<string, Map<string, number>> | undefined;
  // streamId -> (sessionId -> lastSeenMs)
}

function getSessions(): Map<string, Map<string, number>> {
  if (!globalThis.__EFU_VIEWERS__) globalThis.__EFU_VIEWERS__ = new Map();
  return globalThis.__EFU_VIEWERS__;
}

export function recordViewer(streamId: string, sessionId: string): number {
  const sessions = getSessions();
  let set = sessions.get(streamId);
  if (!set) {
    set = new Map();
    sessions.set(streamId, set);
  }
  const now = Date.now();
  set.set(sessionId, now);
  // sweep expired
  for (const [sid, ts] of [...set.entries()]) {
    if (now - ts > SESSION_TTL_MS) set.delete(sid);
  }
  return set.size;
}

export function dropViewer(streamId: string, sessionId: string): number {
  const sessions = getSessions();
  const set = sessions.get(streamId);
  if (!set) return 0;
  set.delete(sessionId);
  return set.size;
}

export type RealtimeSnapshot = {
  streamId: string;
  concurrent: number;
  chatRatePerMin: number;
  voteRatePerMin: number;
};

export function snapshot(streamId: string): RealtimeSnapshot {
  const sessions = getSessions();
  const set = sessions.get(streamId);
  const now = Date.now();
  let concurrent = 0;
  if (set) {
    for (const [, ts] of set.entries()) {
      if (now - ts <= SESSION_TTL_MS) concurrent += 1;
    }
  }
  return {
    streamId,
    concurrent,
    // Placeholder rates — wired to actual chat/vote trackers later.
    chatRatePerMin: 0,
    voteRatePerMin: 0,
  };
}
