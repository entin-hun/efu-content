/**
 * EFU fighter storage — file-backed JSON store.
 *
 * Persists fighters in `data/fighters.json`. The functions exposed here
 * are the contract for the rest of the app: server components, admin
 * pages, and JSON-LD all import only from `@/lib/fighters`. When L1-DB
 * ships, the bodies of `read*` / `write*` are replaced with database
 * queries; call sites stay unchanged.
 *
 * Concurrency: a module-level promise chain serialises writes so admin
 * requests can't clobber each other. Reads are not serialised (the file
 * is small and the cache layer in production will be the DB).
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { Locale } from '@/lib/i18n';
import type { Fighter, FighterSummary, EfuPathEntry } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'fighters.json');

/** In-process mutex: serialise concurrent writes. */
let writeLock: Promise<void> = Promise.resolve();

/** Test/admin: if true, storage is bypassed and data is in-memory. */
const SEED_FIGHTERS: Fighter[] = [
  buildSeedFighter('kozak-peter', 'Kozák Péter', '🇭🇺 HU', 1, 18, 2, 0, 12, 4),
  buildSeedFighter('varga-bence', 'Varga Bence', '🇭🇺 HU', 2, 12, 1, 0, 7, 2),
];

function buildSeedFighter(
  slug: string,
  name: string,
  country: string,
  sortOrder: number,
  wins: number,
  losses: number,
  draws: number,
  kos: number,
  subs: number,
): Fighter {
  return {
    slug,
    name: { hu: name, en: name },
    intro: {
      hu: `<p>${name} az EFU Reality 2026-os szériájának egyik legígéretesebb versenyzője.</p>`,
      en: `<p>${name} is one of the most promising contestants of the EFU Reality 2026 season.</p>`,
    },
    story: {
      hu: `<p>${name} több mint tíz éve küzd különböző szabályrendszerekben. Az EFU Realitybe azért jelentkezett, hogy egy saját versenyrendszerben mérhesse össze magát a régió legjobbjaival. Az EFU Ruleset — kéz- és lábtechnikák, korlátozott idejű földharc — pontosan az a környezet, ahol a technikai repertoárja érvényesülni tud.</p><p>Az EFU stábja a szezon során végigkíséri a felkészülését, és a legjobb teljesítményt nyújtó versenyzők számára megnyílik az út az EFU Fight Night gálák felé.</p>`,
      en: `<p>${name} has been competing for over a decade across multiple rule sets. They joined EFU Reality to test themselves in a homegrown format against the region's best. The EFU Ruleset — striking with limited ground time — is exactly the environment where their technical range can shine.</p><p>The EFU staff follows their progress throughout the season, with the top performers earning a path to EFU Fight Night events.</p>`,
    },
    nickname: { hu: '„A Pusztító"', en: '"The Destroyer"' },
    country,
    weightClass: { hu: 'Nehézsúly', en: 'Heavyweight' },
    hometown: { hu: 'Budapest', en: 'Budapest' },
    gym: { hu: 'EFU Training Center', en: 'EFU Training Center' },
    dob: '1995-06-15',
    heightCm: 188,
    reachCm: 192,
    stance: 'orthodox',
    photo: `/fighters/${slug}.jpg`,
    record: { wins, losses, draws, kos, submissions: subs },
    fightHistory: [],
    efuPath: [
      {
        stage: 'reality',
        date: '2026-07-17',
        title: {
          hu: 'EFU Reality 2026 — Versenyző',
          en: 'EFU Reality 2026 — Contestant',
        },
        description: {
          hu: '<p>2026 nyarán csatlakozott az EFU Reality 2026-os szériájához.</p>',
          en: '<p>Joined the EFU Reality 2026 season in summer 2026.</p>',
        },
      },
    ],
    videos: [],
    published: true,
    sortOrder,
    updatedAt: new Date().toISOString(),
  };
}

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(SEED_FIGHTERS, null, 2), 'utf-8');
  }
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function readAllFighters(): Promise<Fighter[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  const parsed = JSON.parse(raw) as Fighter[];
  return sortFighters(parsed);
}

export async function readFighter(slug: string): Promise<Fighter | null> {
  const all = await readAllFighters();
  return all.find((f) => f.slug === slug) ?? null;
}

export async function readPublishedFighters(): Promise<Fighter[]> {
  const all = await readAllFighters();
  return all.filter((f) => f.published);
}

export async function readFighterSlugs(): Promise<string[]> {
  const all = await readAllFighters();
  return all.map((f) => f.slug);
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function writeAllFighters(list: Fighter[]): Promise<void> {
  const prev = writeLock;
  let release: () => void = () => {};
  writeLock = new Promise<void>((res) => (release = res));
  try {
    await prev;
    await ensureFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(sortFighters(list), null, 2), 'utf-8');
  } finally {
    release();
  }
}

export async function upsertFighter(fighter: Fighter): Promise<void> {
  const all = await readAllFighters();
  const idx = all.findIndex((f) => f.slug === fighter.slug);
  const stamped: Fighter = { ...fighter, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = stamped;
  } else {
    all.push(stamped);
  }
  await writeAllFighters(all);
}

export async function deleteFighter(slug: string): Promise<boolean> {
  const all = await readAllFighters();
  const next = all.filter((f) => f.slug !== slug);
  if (next.length === all.length) return false;
  await writeAllFighters(next);
  return true;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortFighters(list: Fighter[]): Fighter[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    const an = a.name.hu ?? a.name.en ?? a.slug;
    const bn = b.name.hu ?? b.name.en ?? b.slug;
    return an.localeCompare(bn);
  });
}

/** Pick the localised string for the given locale, with sensible fallbacks. */
export function pickLocalized<T extends string>(
  value: Partial<Record<Locale, T>> | undefined,
  locale: Locale,
): T {
  if (!value) return '' as T;
  if (value[locale]) return value[locale] as T;
  if (value.hu) return value.hu as T;
  if (value.en) return value.en as T;
  for (const k of Object.keys(value) as Locale[]) {
    if (value[k]) return value[k] as T;
  }
  return '' as T;
}

/** Derive a `FighterSummary` (listing-friendly shape) for a fighter. */
export function toSummary(fighter: Fighter, locale: Locale): FighterSummary {
  const firstPath: EfuPathEntry | undefined = fighter.efuPath?.[0];
  return {
    slug: fighter.slug,
    name: pickLocalized(fighter.name, locale),
    nickname: pickLocalized(fighter.nickname, locale),
    country: fighter.country,
    photo: fighter.photo,
    weightClass: pickLocalized(fighter.weightClass, locale),
    hometown: pickLocalized(fighter.hometown, locale),
    record: fighter.record,
    efuPathTeaser: firstPath
      ? {
          stage: firstPath.stage,
          title: pickLocalized(firstPath.title, locale),
          date: firstPath.date,
        }
      : null,
  };
}

/** Slug-ify an arbitrary display name. ASCII-friendly, dash-separated. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** True if the locale is RTL (right-to-left). Re-export convenience. */
export { isRtl } from '@/lib/i18n';
