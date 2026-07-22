/**
 * EFU Analytics Dashboard — chrome i18n.
 *
 * The dashboard data is numeric / language-agnostic; only the labels,
 * buttons and headers are translated. 9 locales match the L1-L8 spec
 * (hu, en, de, sk, ro, pl, fr, es, it).
 *
 * Falls back to English if a key is missing in the current locale.
 */

export const SUPPORTED_LOCALES = ['hu', 'en', 'de', 'sk', 'ro', 'pl', 'fr', 'es', 'it'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  hu: 'Magyar',
  en: 'English',
  de: 'Deutsch',
  sk: 'Slovenčina',
  ro: 'Română',
  pl: 'Polski',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
};

type Dictionary = {
  title: string;
  subtitle: string;
  dateRange: string;
  last24h: string;
  last7d: string;
  last30d: string;
  last90d: string;
  custom: string;
  exportCsv: string;
  exportJson: string;
  refreshing: string;
  refreshNow: string;
  realtime: string;
  realtime_concurrent: string;
  realtime_chat: string;
  realtime_vote: string;
  visitors: string;
  activity: string;
  subscriptions: string;
  viewership: string;
  votes: string;
  interactions: string;
  page_views: string;
  unique_visitors: string;
  by_locale: string;
  signups: string;
  active_users: string;
  returning_users: string;
  returning_rate: string;
  new_subs: string;
  renewed: string;
  churned: string;
  ltv: string;
  revenue: string;
  net_change: string;
  stream: string;
  concurrent_peak: string;
  total_viewer_minutes: string;
  free_votes: string;
  paid_votes: string;
  vote_revenue: string;
  free_triggers: string;
  paid_triggers: string;
  zone: string;
  count: string;
  no_data: string;
  live: string;
  offline: string;
  from: string;
  to: string;
  apply: string;
  loading: string;
  no_events_yet: string;
  seed_demo_data: string;
  reset: string;
  confirm_reset: string;
  export_filename_prefix: string;
  currency: string;
  option: string;
  minutes: string;
  unique: string;
  views: string;
};

const en: Dictionary = {
  title: 'Analytics Dashboard',
  subtitle: 'Operational view across visitors, activity, subscriptions, viewership, votes and interactions.',
  dateRange: 'Date range',
  last24h: 'Last 24h',
  last7d: 'Last 7d',
  last30d: 'Last 30d',
  last90d: 'Last 90d',
  custom: 'Custom',
  exportCsv: 'Export CSV',
  exportJson: 'Export JSON',
  refreshing: 'Refreshing…',
  refreshNow: 'Refresh now',
  realtime: 'Realtime',
  realtime_concurrent: 'Concurrent viewers',
  realtime_chat: 'Chat msgs / min',
  realtime_vote: 'Votes / min',
  visitors: 'Visitors',
  activity: 'User activity',
  subscriptions: 'Subscriptions',
  viewership: 'Viewership',
  votes: 'Votes',
  interactions: 'Reality interactions',
  page_views: 'Page views',
  unique_visitors: 'Unique visitors',
  by_locale: 'By locale',
  signups: 'Signups',
  active_users: 'Active users',
  returning_users: 'Returning users',
  returning_rate: 'Returning rate',
  new_subs: 'New',
  renewed: 'Renewed',
  churned: 'Churned',
  ltv: 'Avg LTV',
  revenue: 'Revenue',
  net_change: 'Net change',
  stream: 'Stream',
  concurrent_peak: 'Concurrent peak',
  total_viewer_minutes: 'Total viewer-minutes',
  free_votes: 'Free votes',
  paid_votes: 'Paid votes',
  vote_revenue: 'Revenue (paid votes)',
  free_triggers: 'Free triggers',
  paid_triggers: 'Paid triggers',
  zone: 'Zone',
  count: 'Count',
  no_data: 'No data in this range',
  live: 'LIVE',
  offline: 'Offline',
  from: 'From',
  to: 'To',
  apply: 'Apply',
  loading: 'Loading',
  no_events_yet: 'No analytics events yet. Hit “Seed demo data” to populate the dashboard.',
  seed_demo_data: 'Seed demo data',
  reset: 'Reset',
  confirm_reset: 'Delete all analytics events? This cannot be undone.',
  export_filename_prefix: 'efu-analytics',
  currency: 'HUF',
  option: 'Option',
  minutes: 'min',
  unique: 'unique',
  views: 'views',
};

const hu: Dictionary = {
  ...en,
  title: 'Analitikai Dashboard',
  subtitle: 'Látogatók, aktivitás, előfizetések, nézettség, szavazatok és interakciók áttekintése.',
  dateRange: 'Időszak',
  last24h: 'Utolsó 24 óra',
  last7d: 'Utolsó 7 nap',
  last30d: 'Utolsó 30 nap',
  last90d: 'Utolsó 90 nap',
  custom: 'Egyedi',
  exportCsv: 'CSV export',
  exportJson: 'JSON export',
  refreshing: 'Frissítés…',
  refreshNow: 'Frissítés most',
  realtime: 'Élő',
  realtime_concurrent: 'Egyidejű nézők',
  realtime_chat: 'Chat üzenet / perc',
  realtime_vote: 'Szavazat / perc',
  visitors: 'Látogatók',
  activity: 'Felhasználói aktivitás',
  subscriptions: 'Előfizetések',
  viewership: 'Nézettség',
  votes: 'Szavazatok',
  interactions: 'Reality interakciók',
  page_views: 'Oldalmegtekintések',
  unique_visitors: 'Egyedi látogatók',
  by_locale: 'Nyelvenként',
  signups: 'Regisztrációk',
  active_users: 'Aktív felhasználók',
  returning_users: 'Visszatérők',
  returning_rate: 'Visszatérési arány',
  new_subs: 'Új',
  renewed: 'Megújult',
  churned: 'Lemorzsolódott',
  ltv: 'Átlag LTV',
  revenue: 'Bevétel',
  net_change: 'Nettó változás',
  stream: 'Stream',
  concurrent_peak: 'Csúcskonkurencia',
  total_viewer_minutes: 'Összes néző-perc',
  free_votes: 'Ingyenes szavazatok',
  paid_votes: 'Fizetős szavazatok',
  vote_revenue: 'Bevétel (fizetős)',
  free_triggers: 'Ingyenes triggerek',
  paid_triggers: 'Fizetős triggerek',
  zone: 'Zóna',
  count: 'Darabszám',
  no_data: 'Nincs adat ebben az időszakban',
  live: 'ÉLŐ',
  offline: 'Nem élő',
  from: 'Ettől',
  to: 'Eddig',
  apply: 'Alkalmaz',
  loading: 'Betöltés',
  no_events_yet: 'Még nincs analitikai esemény. Kattints a „Demo adat seedelése” gombra.',
  seed_demo_data: 'Demo adat seedelése',
  reset: 'Reset',
  confirm_reset: 'Töröljük az összes analitikai eseményt? Ezt nem lehet visszavonni.',
  export_filename_prefix: 'efu-analitika',
  currency: 'HUF',
  option: 'Opció',
  minutes: 'perc',
  unique: 'egyedi',
  views: 'megtekintés',
};

const de: Dictionary = {
  ...en,
  title: 'Analytics-Dashboard',
  subtitle: 'Besucher, Aktivität, Abos, Zuschauer, Stimmen und Interaktionen auf einen Blick.',
  dateRange: 'Zeitraum',
  last24h: 'Letzte 24 Std.',
  last7d: 'Letzte 7 Tage',
  last30d: 'Letzte 30 Tage',
  last90d: 'Letzte 90 Tage',
  custom: 'Eigen',
  exportCsv: 'CSV exportieren',
  exportJson: 'JSON exportieren',
  refreshing: 'Aktualisiere…',
  refreshNow: 'Jetzt aktualisieren',
  realtime: 'Echtzeit',
  realtime_concurrent: 'Gleichzeitige Zuschauer',
  realtime_chat: 'Chat-Nachr. / Min.',
  realtime_vote: 'Stimmen / Min.',
  visitors: 'Besucher',
  activity: 'Nutzeraktivität',
  subscriptions: 'Abos',
  viewership: 'Zuschauer',
  votes: 'Stimmen',
  interactions: 'Reality-Interaktionen',
  page_views: 'Seitenaufrufe',
  unique_visitors: 'Eindeutige Besucher',
  by_locale: 'Nach Sprache',
  signups: 'Anmeldungen',
  active_users: 'Aktive Nutzer',
  returning_users: 'Wiederkehrer',
  returning_rate: 'Wiederkehrerquote',
  new_subs: 'Neu',
  renewed: 'Verlängert',
  churned: 'Abgeworben',
  ltv: 'Ø LTV',
  revenue: 'Umsatz',
  net_change: 'Netto',
  stream: 'Stream',
  concurrent_peak: 'Peak-Zuschauer',
  total_viewer_minutes: 'Zuschauer-Minuten',
  free_votes: 'Gratisstimmen',
  paid_votes: 'Bezahlte Stimmen',
  vote_revenue: 'Umsatz (bezahlt)',
  free_triggers: 'Gratis-Trigger',
  paid_triggers: 'Bezahlte Trigger',
  zone: 'Zone',
  count: 'Anzahl',
  no_data: 'Keine Daten in diesem Zeitraum',
  live: 'LIVE',
  offline: 'Offline',
  from: 'Von',
  to: 'Bis',
  apply: 'Anwenden',
  loading: 'Lade',
  no_events_yet: 'Noch keine Analytics-Events. Klicke auf „Demo-Daten erzeugen“.',
  seed_demo_data: 'Demo-Daten erzeugen',
  reset: 'Zurücksetzen',
  confirm_reset: 'Alle Analytics-Events löschen? Dies kann nicht rückgängig gemacht werden.',
  export_filename_prefix: 'efu-analytics',
  currency: 'HUF',
  option: 'Option',
  minutes: 'Min.',
  unique: 'eindeutig',
  views: 'Aufrufe',
};

const sk: Dictionary = {
  ...en,
  title: 'Analytický dashboard',
  subtitle: 'Prehľad návštevníkov, aktivít, predplatného, sledovanosti, hlasov a interakcií.',
  realtime_concurrent: 'Súčasní diváci',
  realtime_chat: 'Chat / min',
  realtime_vote: 'Hlasy / min',
  visitors: 'Návštevníci',
  activity: 'Aktivita používateľov',
  subscriptions: 'Predplatné',
  viewership: 'Sledovanosť',
  votes: 'Hlasy',
  interactions: 'Interakcie Reality',
  page_views: 'Zobrazenia',
  unique_visitors: 'Unikátni návštevníci',
  signups: 'Registrácie',
  active_users: 'Aktívni používatelia',
  returning_users: 'Vracajúci sa',
  new_subs: 'Nové',
  renewed: 'Obnovené',
  churned: 'Odišli',
  revenue: 'Príjem',
  from: 'Od',
  to: 'Do',
  apply: 'Použiť',
};

const ro: Dictionary = {
  ...en,
  title: 'Panou de analiză',
  subtitle: 'Vizitatori, activitate, abonamente, audiență, voturi și interacțiuni.',
  visitors: 'Vizitatori',
  activity: 'Activitate utilizatori',
  subscriptions: 'Abonamente',
  viewership: 'Audiență',
  votes: 'Voturi',
  interactions: 'Interacțiuni Reality',
  page_views: 'Vizualizări',
  unique_visitors: 'Vizitatori unici',
  signups: 'Înregistrări',
  active_users: 'Utilizatori activi',
  revenue: 'Venit',
  from: 'De la',
  to: 'Până la',
  apply: 'Aplică',
};

const pl: Dictionary = {
  ...en,
  title: 'Panel analityczny',
  subtitle: 'Odwiedzający, aktywność, subskrypcje, oglądalność, głosy i interakcje.',
  visitors: 'Odwiedzający',
  activity: 'Aktywność użytkowników',
  subscriptions: 'Subskrypcje',
  viewership: 'Oglądalność',
  votes: 'Głosy',
  interactions: 'Interakcje Reality',
  page_views: 'Wyświetlenia',
  unique_visitors: 'Unikalni odwiedzający',
  signups: 'Rejestracje',
  active_users: 'Aktywni użytkownicy',
  revenue: 'Przychód',
  from: 'Od',
  to: 'Do',
  apply: 'Zastosuj',
};

const fr: Dictionary = {
  ...en,
  title: 'Tableau analytique',
  subtitle: 'Visiteurs, activité, abonnements, audience, votes et interactions.',
  visitors: 'Visiteurs',
  activity: 'Activité utilisateur',
  subscriptions: 'Abonnements',
  viewership: 'Audience',
  votes: 'Votes',
  interactions: 'Interactions Reality',
  page_views: 'Pages vues',
  unique_visitors: 'Visiteurs uniques',
  signups: 'Inscriptions',
  active_users: 'Utilisateurs actifs',
  revenue: 'Revenu',
  from: 'Du',
  to: 'Au',
  apply: 'Appliquer',
};

const es: Dictionary = {
  ...en,
  title: 'Panel de analítica',
  subtitle: 'Visitantes, actividad, suscripciones, audiencia, votos e interacciones.',
  visitors: 'Visitantes',
  activity: 'Actividad de usuarios',
  subscriptions: 'Suscripciones',
  viewership: 'Audiencia',
  votes: 'Votos',
  interactions: 'Interacciones Reality',
  page_views: 'Páginas vistas',
  unique_visitors: 'Visitantes únicos',
  signups: 'Registros',
  active_users: 'Usuarios activos',
  revenue: 'Ingresos',
  from: 'Desde',
  to: 'Hasta',
  apply: 'Aplicar',
};

const it: Dictionary = {
  ...en,
  title: 'Dashboard analitica',
  subtitle: 'Visitatori, attività, abbonamenti, audience, voti e interazioni.',
  visitors: 'Visitatori',
  activity: 'Attività utenti',
  subscriptions: 'Abbonamenti',
  viewership: 'Audience',
  votes: 'Voti',
  interactions: 'Interazioni Reality',
  page_views: 'Visualizzazioni',
  unique_visitors: 'Visitatori unici',
  signups: 'Registrazioni',
  active_users: 'Utenti attivi',
  revenue: 'Ricavi',
  from: 'Da',
  to: 'A',
  apply: 'Applica',
};

export const DICTIONARIES: Record<Locale, Dictionary> = {
  hu, en, de, sk, ro, pl, fr, es, it,
};

export function t(locale: Locale, key: keyof Dictionary): string {
  return DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key;
}
