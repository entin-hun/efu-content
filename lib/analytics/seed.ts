/**
 * EFU Analytics — demo-data seeder.
 *
 * Generates 14 days of synthetic-but-plausible traffic so the dashboard
 * renders real-looking numbers in dev. Used by the "Seed demo data"
 * button on the dashboard and by tests.
 */

import { trackBatch } from './store';
import type { AnalyticsEvent } from './types';

const LOCALES = ['hu', 'en', 'de', 'sk', 'ro', 'pl', 'fr', 'es', 'it'] as const;
const STREAMS = ['fight_night_jul17', 'reality_zone_a', 'fight_night_main'] as const;
const ZONES = ['ring_a', 'ring_b', 'pyro_main', 'crowd_pulse', 'lighting_bar'] as const;
const VOTE_OPTIONS = ['option_alpha', 'option_beta', 'option_gamma', 'option_delta'] as const;

function uid(prefix: string, i: number): string {
  return `${prefix}_${i.toString(36)}`;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedDemoEvents(daysBack = 14): Promise<number> {
  const events: AnalyticsEvent[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // 800 visitors across the window; each visits 1-4 pages
  const totalUsers = 800;
  for (let u = 0; u < totalUsers; u++) {
    const signupTs = now - Math.floor(Math.random() * daysBack * dayMs);
    const userId = uid('user', u);
    const locale = pick(LOCALES);
    events.push({ category: 'activity', kind: 'signup', userId, locale });
    if (Math.random() < 0.7) {
      events.push({ category: 'activity', kind: 'login', userId, locale });
    }
    // activity + returning
    for (let h = 0; h < 1 + Math.floor(Math.random() * 6); h++) {
      events.push({
        category: 'activity',
        kind: Math.random() < 0.4 ? 'returning' : 'active',
        userId,
        locale,
      });
    }
    // pageviews
    const pvCount = 1 + Math.floor(Math.random() * 4);
    for (let p = 0; p < pvCount; p++) {
      const path = pick(['/', '/#pricing', '/#fight-card', '/watch', '/success', '/mit-nyerhetsz']);
      events.push({
        category: 'visitor',
        kind: 'pageview',
        locale,
        path,
        visitorId: uid('v', u),
      });
    }
    // 25% subscribe
    if (Math.random() < 0.25) {
      const amount = 2500 + Math.floor(Math.random() * 5) * 1000;
      events.push({
        category: 'subscription',
        kind: 'new',
        userId,
        planId: pick(['basic', 'pro', 'vip']),
        amountHuf: amount,
      });
    }
    // 5% have churned
    if (Math.random() < 0.05) {
      events.push({ category: 'subscription', kind: 'churned', userId });
    }
    // 8% have renewed
    if (Math.random() < 0.08) {
      events.push({
        category: 'subscription',
        kind: 'renewed',
        userId,
        amountHuf: 2500,
      });
    }
    void signupTs; // currently collapsed into window; could offset later
  }

  // viewership: fan-out heartbeats for each stream
  for (const sid of STREAMS) {
    const sessions = 30 + Math.floor(Math.random() * 400);
    for (let s = 0; s < sessions; s++) {
      events.push({
        category: 'viewership',
        kind: 'heartbeat',
        streamId: sid,
        userId: uid('vw', s),
        concurrent: 1,
      });
      events.push({
        category: 'viewership',
        kind: 'session_end',
        streamId: sid,
        userId: uid('vw', s),
        viewerMinutes: 5 + Math.floor(Math.random() * 30),
      });
    }
  }

  // votes: lots of free, fewer paid
  for (let i = 0; i < 2400; i++) {
    const userId = uid('voter', i);
    const optionId = pick(VOTE_OPTIONS);
    if (Math.random() < 0.85) {
      events.push({ category: 'vote', kind: 'free', userId, optionId });
    } else {
      events.push({
        category: 'vote',
        kind: 'paid',
        userId,
        optionId,
        amountHuf: 100 + Math.floor(Math.random() * 20) * 50,
      });
    }
  }

  // reality interactions
  for (let i = 0; i < 600; i++) {
    events.push({
      category: 'interaction',
      kind: 'reality_trigger',
      zone: pick(ZONES),
      tier: Math.random() < 0.7 ? 'free' : 'paid',
      amountHuf: Math.random() < 0.7 ? undefined : 200 + Math.floor(Math.random() * 15) * 100,
      userId: uid('iu', i),
    });
  }

  return trackBatch(events);
}
