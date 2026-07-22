/**
 * EFU Analytics — in-process event store (demo mode).
 *
 * The L8 brief is "ship the dashboard + dep seams". Once a real database
 * lands (Postgres / ClickHouse), replace `EVENTS` with a thin repository
 * and keep the public function surface intact.
 *
 * Data lives in two places:
 *   - a process-local array (fast for API routes on the same Node instance)
 *   - a JSON file at /tmp/efu-analytics.json (survives HMR reloads during dev)
 *
 * In production this whole module would be replaced; for now it gives the
 * dashboard real numbers to render against.
 */

import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import type { AnalyticsEvent, AnalyticsEventStored } from './types';

const STORE_PATH = process.env.EFU_ANALYTICS_STORE ?? '/tmp/efu-analytics.json';
const MAX_EVENTS = 50_000; // ring-buffer cap to keep dev memory bounded

declare global {
  // eslint-disable-next-line no-var
  var __EFU_EVENTS__: AnalyticsEventStored[] | undefined;
}

let EVENTS: AnalyticsEventStored[] | undefined;

async function loadFromDisk(): Promise<AnalyticsEventStored[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as AnalyticsEventStored[];
  } catch {
    // file missing or malformed — start fresh
  }
  return [];
}

async function persistToDisk(events: AnalyticsEventStored[]): Promise<void> {
  try {
    await fs.writeFile(STORE_PATH, JSON.stringify(events), 'utf-8');
  } catch {
    // disk unavailable — silently keep in-memory state
  }
}

async function getEvents(): Promise<AnalyticsEventStored[]> {
  if (EVENTS) return EVENTS;
  // Reuse across HMR in dev
  if (process.env.NODE_ENV !== 'production' && globalThis.__EFU_EVENTS__) {
    EVENTS = globalThis.__EFU_EVENTS__;
    return EVENTS;
  }
  EVENTS = await loadFromDisk();
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__EFU_EVENTS__ = EVENTS;
  }
  return EVENTS;
}

export async function trackEvent(event: AnalyticsEvent): Promise<AnalyticsEventStored> {
  const stored: AnalyticsEventStored = {
    ...event,
    id: randomUUID(),
    ts: Date.now(),
  };
  const events = await getEvents();
  events.push(stored);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
  await persistToDisk(events);
  return stored;
}

export async function trackBatch(events: AnalyticsEvent[]): Promise<number> {
  const stored: AnalyticsEventStored[] = events.map((e) => ({
    ...e,
    id: randomUUID(),
    ts: Date.now(),
  }));
  const all = await getEvents();
  all.push(...stored);
  if (all.length > MAX_EVENTS) {
    all.splice(0, all.length - MAX_EVENTS);
  }
  await persistToDisk(all);
  return stored.length;
}

export async function readEvents(opts?: { sinceMs?: number; untilMs?: number; limit?: number }): Promise<AnalyticsEventStored[]> {
  const events = await getEvents();
  const sinceMs = opts?.sinceMs ?? 0;
  const untilMs = opts?.untilMs ?? Number.POSITIVE_INFINITY;
  const limit = opts?.limit ?? events.length;
  const filtered: AnalyticsEventStored[] = [];
  // iterate from newest backward so the limit caps the most-recent
  for (let i = events.length - 1; i >= 0 && filtered.length < limit; i--) {
    const e = events[i];
    if (e.ts >= sinceMs && e.ts <= untilMs) filtered.push(e);
  }
  return filtered.reverse();
}

export async function resetEvents(): Promise<void> {
  EVENTS = [];
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__EFU_EVENTS__ = [];
  }
  await persistToDisk([]);
}

// Re-export the canonical seeder from ./seed so the admin page can
// import it through this module without losing in-memory state.
export { seedDemoEvents } from './seed';
