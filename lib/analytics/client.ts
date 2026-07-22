/**
 * EFU Analytics — client-side helpers for emitting events from the browser.
 *
 * Uses navigator.sendBeacon when available (more reliable for unload events),
 * falls back to fetch. All functions are no-op on the server.
 */

import type {
  ActivityEvent,
  AnalyticsEvent,
  InteractionEvent,
  SubscriptionEvent,
  VoteEvent,
} from './types';

const ENDPOINT = '/api/analytics/track';

function send(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify(event);
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(ENDPOINT, blob);
      return;
    }
  } catch {
    // fall through
  }
  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // swallow — analytics is best-effort
  });
}

function getOrCreateVisitorId(): string {
  if (typeof document === 'undefined') return 'srv';
  const KEY = 'efu_visitor_id';
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = 'v-' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'v-' + Math.random().toString(36).slice(2, 12);
  }
}

function getLocale(): string {
  if (typeof document === 'undefined') return 'hu';
  return document.documentElement.lang || 'hu';
}

export function trackPageview(path?: string): void {
  send({
    category: 'visitor',
    kind: 'pageview',
    locale: getLocale(),
    path: path || (typeof location !== 'undefined' ? location.pathname : '/'),
    visitorId: getOrCreateVisitorId(),
  });
}

export function trackSignup(userId: string): void {
  const e: ActivityEvent = { category: 'activity', kind: 'signup', userId, locale: getLocale() };
  send(e);
}

export function trackLogin(userId: string): void {
  const e: ActivityEvent = { category: 'activity', kind: 'login', userId, locale: getLocale() };
  send(e);
}

export function trackActive(userId: string): void {
  const e: ActivityEvent = { category: 'activity', kind: 'active', userId, locale: getLocale() };
  send(e);
}

export function trackReturning(userId: string): void {
  const e: ActivityEvent = { category: 'activity', kind: 'returning', userId, locale: getLocale() };
  send(e);
}

export function trackSubscription(
  userId: string,
  kind: 'new' | 'renewed' | 'churned' | 'ltv_update',
  amountHuf?: number,
  planId?: string,
): void {
  const e: SubscriptionEvent = {
    category: 'subscription',
    kind,
    userId,
    amountHuf,
    planId,
  };
  send(e);
}

export function trackPaidVote(
  userId: string,
  optionId: string,
  amountHuf: number,
  realityId?: string,
): void {
  const e: VoteEvent = {
    category: 'vote',
    kind: 'paid',
    userId,
    optionId,
    amountHuf,
    realityId,
  };
  send(e);
}

export function trackFreeVote(userId: string, optionId: string, realityId?: string): void {
  const e: VoteEvent = {
    category: 'vote',
    kind: 'free',
    userId,
    optionId,
    realityId,
  };
  send(e);
}

export function trackInteraction(
  zone: string,
  tier: 'free' | 'paid',
  amountHuf?: number,
  userId?: string,
): void {
  const e: InteractionEvent = {
    category: 'interaction',
    kind: 'reality_trigger',
    zone,
    tier,
    amountHuf,
    userId,
  };
  send(e);
}
