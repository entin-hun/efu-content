/**
 * EFU Analytics — aggregation pipeline.
 *
 * Pure functions over the stored event log that produce the six metric
 * groups the dashboard renders. Each function takes the full event list
 * for a (since, until) window and returns a flat object the UI can render.
 */

import type { AnalyticsEventStored } from './types';

export type DateRange = { sinceMs: number; untilMs: number };

export type VisitorStats = {
  pageViews: number;
  uniqueVisitors: number;
  byLocale: { locale: string; views: number; uniques: number }[];
};

export type ActivityStats = {
  signups: number;
  activeUsers: number;
  returningUsers: number;
  returningRate: number; // 0..1
};

export type SubscriptionStats = {
  newCount: number;
  renewedCount: number;
  churnedCount: number;
  revenueHuf: number;
  ltvHuf: number;
  netChange: number;    // new + renewed − churned
};

export type ViewershipStats = {
  byStream: {
    streamId: string;
    concurrentPeak: number;
    totalViewerMinutes: number;
    heartbeats: number;
  }[];
  totalViewerMinutes: number;
  overallPeak: number;
};

export type VoteStats = {
  freeCount: number;
  paidCount: number;
  revenueHuf: number;
  byOption: { optionId: string; count: number; revenueHuf: number }[];
};

export type InteractionStats = {
  totals: { free: number; paid: number };
  revenueHuf: number;
  byZone: { zone: string; count: number; revenueHuf: number }[];
};

export type AnalyticsSummary = {
  range: DateRange;
  visitors: VisitorStats;
  activity: ActivityStats;
  subscriptions: SubscriptionStats;
  viewership: ViewershipStats;
  votes: VoteStats;
  interactions: InteractionStats;
};

function uniqueCount<T>(items: T[], key: (t: T) => string | undefined): number {
  const set = new Set<string>();
  for (const i of items) {
    const k = key(i);
    if (k) set.add(k);
  }
  return set.size;
}

export function summarize(
  events: AnalyticsEventStored[],
  range: DateRange,
): AnalyticsSummary {
  const inRange = events.filter((e) => e.ts >= range.sinceMs && e.ts <= range.untilMs);

  // --- Visitors ---
  const pageviews = inRange.filter((e) => e.category === 'visitor' && e.kind === 'pageview');
  const visitorIds = pageviews
    .map((e) => (e.category === 'visitor' ? (e as any).visitorId : undefined))
    .filter(Boolean) as string[];
  const byLocaleMap = new Map<string, { views: number; ids: Set<string> }>();
  for (const v of pageviews) {
    if (v.category !== 'visitor') continue;
    const locale = v.locale || 'unknown';
    const entry = byLocaleMap.get(locale) ?? { views: 0, ids: new Set<string>() };
    entry.views += 1;
    if ((v as any).visitorId) entry.ids.add((v as any).visitorId);
    byLocaleMap.set(locale, entry);
  }
  const visitors: VisitorStats = {
    pageViews: pageviews.length,
    uniqueVisitors: uniqueCount(pageviews, () => undefined) || new Set(visitorIds).size,
    byLocale: [...byLocaleMap.entries()]
      .map(([locale, v]) => ({ locale, views: v.views, uniques: v.ids.size }))
      .sort((a, b) => b.views - a.views),
  };

  // --- Activity ---
  const signups = inRange.filter((e) => e.category === 'activity' && e.kind === 'signup');
  const active = inRange.filter((e) => e.category === 'activity' && e.kind === 'active');
  const returning = inRange.filter((e) => e.category === 'activity' && e.kind === 'returning');
  const activeUsers = new Set(active.map((e) => (e.category === 'activity' ? (e as any).userId : undefined)).filter(Boolean) as string[]).size;
  const returningUsers = new Set(returning.map((e) => (e.category === 'activity' ? (e as any).userId : undefined)).filter(Boolean) as string[]).size;
  const activity: ActivityStats = {
    signups: signups.length,
    activeUsers,
    returningUsers,
    returningRate: activeUsers ? returningUsers / activeUsers : 0,
  };

  // --- Subscriptions ---
  const subs = inRange.filter((e) => e.category === 'subscription');
  let revenue = 0;
  let ltvSum = 0;
  let ltvCount = 0;
  let newC = 0;
  let renewedC = 0;
  let churnedC = 0;
  for (const s of subs) {
    if (s.category !== 'subscription') continue;
    const amount = (s as any).amountHuf ?? 0;
    if (s.kind === 'new') {
      newC += 1;
      revenue += amount;
      ltvSum += amount;
      ltvCount += 1;
    } else if (s.kind === 'renewed') {
      renewedC += 1;
      revenue += amount;
      ltvSum += amount;
      ltvCount += 1;
    } else if (s.kind === 'churned') {
      churnedC += 1;
    } else if (s.kind === 'ltv_update') {
      ltvSum += amount;
      ltvCount += 1;
    }
  }
  const subscriptions: SubscriptionStats = {
    newCount: newC,
    renewedCount: renewedC,
    churnedCount: churnedC,
    revenueHuf: revenue,
    ltvHuf: ltvCount ? Math.round(ltvSum / ltvCount) : 0,
    netChange: newC + renewedC - churnedC,
  };

  // --- Viewership ---
  const viewEvents = inRange.filter((e) => e.category === 'viewership');
  const byStream = new Map<string, { peak: number; minutes: number; heartbeats: number }>();
  let totalMinutes = 0;
  let overallPeak = 0;
  for (const v of viewEvents) {
    if (v.category !== 'viewership') continue;
    const sid = v.streamId || 'unknown';
    const cur = byStream.get(sid) ?? { peak: 0, minutes: 0, heartbeats: 0 };
    if (v.kind === 'heartbeat') {
      cur.heartbeats += 1;
      const conc = (v as any).concurrent ?? 0;
      if (conc > cur.peak) cur.peak = conc;
      if (conc > overallPeak) overallPeak = conc;
    } else if (v.kind === 'peak') {
      const conc = (v as any).concurrent ?? 0;
      if (conc > cur.peak) cur.peak = conc;
      if (conc > overallPeak) overallPeak = conc;
    } else if (v.kind === 'session_end') {
      cur.minutes += (v as any).viewerMinutes ?? 0;
      totalMinutes += (v as any).viewerMinutes ?? 0;
    }
    byStream.set(sid, cur);
  }
  // also fold heartbeats' implied minutes
  for (const [sid, cur] of byStream.entries()) {
    cur.minutes += cur.heartbeats; // 1-min heartbeat = 1 viewer-minute each
  }
  totalMinutes += [...byStream.values()].reduce((acc, v) => acc + v.heartbeats, 0);
  const viewership: ViewershipStats = {
    byStream: [...byStream.entries()].map(([streamId, v]) => ({
      streamId,
      concurrentPeak: v.peak,
      totalViewerMinutes: v.minutes,
      heartbeats: v.heartbeats,
    })),
    totalViewerMinutes: totalMinutes,
    overallPeak,
  };

  // --- Votes ---
  const votes = inRange.filter((e) => e.category === 'vote');
  let free = 0;
  let paid = 0;
  let voteRevenue = 0;
  const byOptionMap = new Map<string, { count: number; revenue: number }>();
  for (const v of votes) {
    if (v.category !== 'vote') continue;
    const amount = (v as any).amountHuf ?? 0;
    if (v.kind === 'free') free += 1;
    else if (v.kind === 'paid') paid += 1;
    voteRevenue += amount;
    const opt = (v as any).optionId || 'unknown';
    const cur = byOptionMap.get(opt) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += amount;
    byOptionMap.set(opt, cur);
  }
  const voteStats: VoteStats = {
    freeCount: free,
    paidCount: paid,
    revenueHuf: voteRevenue,
    byOption: [...byOptionMap.entries()]
      .map(([optionId, v]) => ({ optionId, count: v.count, revenueHuf: v.revenue }))
      .sort((a, b) => b.count - a.count),
  };

  // --- Interactions (reality triggers) ---
  const interactions = inRange.filter((e) => e.category === 'interaction');
  let freeI = 0;
  let paidI = 0;
  let intRevenue = 0;
  const byZoneMap = new Map<string, { count: number; revenue: number }>();
  for (const i of interactions) {
    if (i.category !== 'interaction') continue;
    const amount = (i as any).amountHuf ?? 0;
    const tier = (i as any).tier;
    if (tier === 'free') freeI += 1;
    else if (tier === 'paid') paidI += 1;
    intRevenue += amount;
    const z = (i as any).zone || 'unknown';
    const cur = byZoneMap.get(z) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += amount;
    byZoneMap.set(z, cur);
  }
  const interactionStats: InteractionStats = {
    totals: { free: freeI, paid: paidI },
    revenueHuf: intRevenue,
    byZone: [...byZoneMap.entries()]
      .map(([zone, v]) => ({ zone, count: v.count, revenueHuf: v.revenue }))
      .sort((a, b) => b.count - a.count),
  };

  return {
    range,
    visitors,
    activity,
    subscriptions,
    viewership,
    votes: voteStats,
    interactions: interactionStats,
  };
}

export function toCsv(summary: AnalyticsSummary): string {
  const lines: string[] = [];
  lines.push('EFU Analytics Export');
  lines.push(`Window: ${new Date(summary.range.sinceMs).toISOString()} -> ${new Date(summary.range.untilMs).toISOString()}`);
  lines.push('');
  lines.push('Section,Key,Value');
  lines.push(`Visitors,page_views,${summary.visitors.pageViews}`);
  lines.push(`Visitors,unique_visitors,${summary.visitors.uniqueVisitors}`);
  for (const l of summary.visitors.byLocale) {
    lines.push(`Visitors_Locale,${l.locale}_views,${l.views}`);
    lines.push(`Visitors_Locale,${l.locale}_uniques,${l.uniques}`);
  }
  lines.push(`Activity,signups,${summary.activity.signups}`);
  lines.push(`Activity,active_users,${summary.activity.activeUsers}`);
  lines.push(`Activity,returning_users,${summary.activity.returningUsers}`);
  lines.push(`Activity,returning_rate,${summary.activity.returningRate.toFixed(4)}`);
  lines.push(`Subscriptions,new,${summary.subscriptions.newCount}`);
  lines.push(`Subscriptions,renewed,${summary.subscriptions.renewedCount}`);
  lines.push(`Subscriptions,churned,${summary.subscriptions.churnedCount}`);
  lines.push(`Subscriptions,revenue_huf,${summary.subscriptions.revenueHuf}`);
  lines.push(`Subscriptions,ltv_huf,${summary.subscriptions.ltvHuf}`);
  lines.push(`Subscriptions,net_change,${summary.subscriptions.netChange}`);
  for (const s of summary.viewership.byStream) {
    lines.push(`Viewership_${s.streamId},concurrent_peak,${s.concurrentPeak}`);
    lines.push(`Viewership_${s.streamId},total_viewer_minutes,${s.totalViewerMinutes}`);
    lines.push(`Viewership_${s.streamId},heartbeats,${s.heartbeats}`);
  }
  lines.push(`Viewership,overall_peak,${summary.viewership.overallPeak}`);
  lines.push(`Viewership,total_minutes,${summary.viewership.totalViewerMinutes}`);
  lines.push(`Votes,free,${summary.votes.freeCount}`);
  lines.push(`Votes,paid,${summary.votes.paidCount}`);
  lines.push(`Votes,revenue_huf,${summary.votes.revenueHuf}`);
  for (const v of summary.votes.byOption) {
    lines.push(`Votes_Option,${v.optionId}_count,${v.count}`);
    lines.push(`Votes_Option,${v.optionId}_revenue_huf,${v.revenueHuf}`);
  }
  lines.push(`Interactions,free,${summary.interactions.totals.free}`);
  lines.push(`Interactions,paid,${summary.interactions.totals.paid}`);
  lines.push(`Interactions,revenue_huf,${summary.interactions.revenueHuf}`);
  for (const z of summary.interactions.byZone) {
    lines.push(`Interactions_Zone,${z.zone}_count,${z.count}`);
    lines.push(`Interactions_Zone,${z.zone}_revenue_huf,${z.revenueHuf}`);
  }
  return lines.join('\n') + '\n';
}
