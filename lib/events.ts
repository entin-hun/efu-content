/**
 * EFU events schedule — single source of truth for hero countdown + CTAs.
 *
 * Add/replace entries as dates firm up. `id` is a slug used for analytics
 * and live-channel routing (YouTube embed, etc.).
 *
 * LIVE channel URLs are configurable here so the L5-streaming layer can
 * pivot the hero embed without touching components.
 */

export interface EfuEvent {
  id: string;
  kind: 'reality' | 'fight_night';
  title: string;
  startsAtIso: string; // ISO 8601 with timezone offset
  venue: string;
  /** Optional live broadcast URL (YouTube channel/live ID, Cloudflare, etc.). */
  liveUrl?: string;
}

const events: EfuEvent[] = [
  {
    id: 'efu-reality-2026-s1',
    kind: 'reality',
    title: 'EFU Reality – 2026 Season',
    startsAtIso: '2026-07-17T15:00:00+02:00',
    venue: 'Budapest Aréna',
    liveUrl: 'https://www.youtube.com/@EliteFightUniverse/live',
  },
  {
    id: 'efu-fight-night-2026-08',
    kind: 'fight_night',
    title: 'EFU Fight Night – Aug 2026',
    startsAtIso: '2026-08-22T19:00:00+02:00',
    venue: 'Budapest Aréna',
    liveUrl: 'https://www.youtube.com/@EliteFightUniverse/live',
  },
  {
    id: 'efu-fight-night-2026-10',
    kind: 'fight_night',
    title: 'EFU Fight Night – Oct 2026',
    startsAtIso: '2026-10-10T19:00:00+02:00',
    venue: 'Papp László Budapest Sportaréna',
  },
];

export function listEvents(): EfuEvent[] {
  return [...events].sort(
    (a, b) => +new Date(a.startsAtIso) - +new Date(b.startsAtIso),
  );
}

export function nextEvent(now: Date = new Date()): EfuEvent | undefined {
  return listEvents().find((e) => +new Date(e.startsAtIso) > now.getTime());
}

export function nextEventByKind(
  kind: EfuEvent['kind'],
  now: Date = new Date(),
): EfuEvent | undefined {
  return listEvents().find(
    (e) => e.kind === kind && +new Date(e.startsAtIso) > now.getTime(),
  );
}