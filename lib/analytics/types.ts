/**
 * EFU Analytics — typed event taxonomy.
 *
 * All payloads use string timestamps + numeric metrics so the same shape
 * survives a future swap from the in-process JSON store to PostgreSQL /
 * ClickHouse / BigQuery.
 *
 * Categories cover the six groups in the L8-ANALYTICS brief:
 *   visitor, activity, subscription, viewership, vote, interaction.
 */

export type AnalyticsCategory =
  | 'visitor'
  | 'activity'
  | 'subscription'
  | 'viewership'
  | 'vote'
  | 'interaction';

export type VisitorEvent = {
  category: 'visitor';
  kind: 'pageview' | 'unique';
  locale: string;       // e.g. "hu", "en"
  path?: string;        // e.g. "/", "/watch"
  visitorId?: string;   // hashed session id (optional)
};

export type ActivityEvent = {
  category: 'activity';
  kind: 'signup' | 'login' | 'active' | 'returning';
  userId: string;
  locale?: string;
};

export type SubscriptionEvent = {
  category: 'subscription';
  kind: 'new' | 'renewed' | 'churned' | 'ltv_update';
  userId: string;
  planId?: string;
  amountHuf?: number;
};

export type ViewershipEvent = {
  category: 'viewership';
  kind: 'heartbeat' | 'peak' | 'session_end';
  streamId: string;
  userId?: string;
  viewerMinutes?: number;
  concurrent?: number;
};

export type VoteEvent = {
  category: 'vote';
  kind: 'free' | 'paid';
  userId: string;
  optionId: string;
  amountHuf?: number; // 0 for free
  realityId?: string;
};

export type InteractionEvent = {
  category: 'interaction';
  kind: 'reality_trigger';
  zone: string;          // e.g. "ring_a", "ring_b", "pyro_main"
  tier: 'free' | 'paid';
  amountHuf?: number;
  userId?: string;
};

export type AnalyticsEvent =
  | VisitorEvent
  | ActivityEvent
  | SubscriptionEvent
  | ViewershipEvent
  | VoteEvent
  | InteractionEvent;

export type AnalyticsEventStored = AnalyticsEvent & {
  id: string;            // uuid-ish
  ts: number;            // epoch ms
};
