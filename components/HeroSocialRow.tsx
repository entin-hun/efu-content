'use client';

import {
  Youtube,
  Twitch,
  ExternalLink,
  Music2,
  Facebook,
  Instagram,
  Twitter,
  type LucideIcon,
} from 'lucide-react';
import { type Locale, flatten, makeT } from '@/lib/i18n';
import { useEffect, useMemo, useState } from 'react';

interface SocialPlatform {
  key:
    | 'youtube'
    | 'twitch'
    | 'kick'
    | 'tiktok'
    | 'facebook'
    | 'instagram'
    | 'x'
    | 'dazn';
  href: string;
  labelKey: string;
  Icon: LucideIcon;
  brandClass: string;
}

const platforms: SocialPlatform[] = [
  {
    key: 'youtube',
    href: 'https://www.youtube.com/@EliteFightUniverse',
    labelKey: 'social.youtube',
    Icon: Youtube,
    brandClass: 'hover:bg-red-600/20 hover:border-red-500 hover:text-red-400',
  },
  {
    key: 'twitch',
    href: 'https://www.twitch.tv/elitefightuniverse',
    labelKey: 'social.twitch',
    Icon: Twitch,
    brandClass: 'hover:bg-purple-600/20 hover:border-purple-500 hover:text-purple-300',
  },
  {
    key: 'kick',
    href: 'https://kick.com/elitefightuniverse',
    labelKey: 'social.kick',
    Icon: ExternalLink,
    brandClass: 'hover:bg-emerald-600/20 hover:border-emerald-500 hover:text-emerald-300',
  },
  {
    key: 'tiktok',
    href: 'https://www.tiktok.com/@elitefightuniverse',
    labelKey: 'social.tiktok',
    Icon: Music2,
    brandClass: 'hover:bg-pink-600/20 hover:border-pink-500 hover:text-pink-300',
  },
  {
    key: 'facebook',
    href: 'https://www.facebook.com/elitefightuniverse',
    labelKey: 'social.facebook',
    Icon: Facebook,
    brandClass: 'hover:bg-blue-600/20 hover:border-blue-500 hover:text-blue-300',
  },
  {
    key: 'instagram',
    href: 'https://www.instagram.com/elitefightuniverse',
    labelKey: 'social.instagram',
    Icon: Instagram,
    brandClass: 'hover:bg-fuchsia-600/20 hover:border-fuchsia-500 hover:text-fuchsia-300',
  },
  {
    key: 'x',
    href: 'https://x.com/EliteFightUniv',
    labelKey: 'social.x',
    Icon: Twitter,
    brandClass: 'hover:bg-slate-500/20 hover:border-slate-400 hover:text-slate-200',
  },
  {
    key: 'dazn',
    href: 'https://www.dazn.com',
    labelKey: 'social.dazn',
    Icon: ExternalLink,
    brandClass: 'hover:bg-orange-600/20 hover:border-orange-500 hover:text-orange-300',
  },
];

interface Props {
  locale?: Locale | string;
  showDazn?: boolean;
}

export function HeroSocialRow({ locale = 'hu', showDazn = false }: Props) {
  const [t, setT] = useState<(k: string) => string>(() => (k: string) => k);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = (await import(`@/messages/${locale}/application.json`)) as {
          default: Record<string, unknown>;
        };
        const huMod = (await import('@/messages/hu/application.json')) as {
          default: Record<string, unknown>;
        };
        const enMod = (await import('@/messages/en/application.json')) as {
          default: Record<string, unknown>;
        };
        if (cancelled) return;
        const dict = flatten(mod.default);
        const fallback = flatten(huMod.default);
        const enDict = flatten(enMod.default);
        // requested → hu → en → key
        setT(makeT(dict, { ...enDict, ...fallback }));
      } catch {
        // best-effort: keep identity t
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const visible = useMemo(
    () => platforms.filter((p) => (showDazn ? true : p.key !== 'dazn')),
    [showDazn],
  );

  return (
    <div className="w-full flex flex-col items-center gap-3 mt-8">
      <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">
        {t('social.heading')}
      </p>
      <ul
        className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap"
        aria-label={t('social.heading')}
      >
        {visible.map(({ key, href, labelKey, Icon, brandClass }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t(labelKey)}
              className={[
                'group inline-flex items-center justify-center',
                'w-10 h-10 sm:w-11 sm:h-11 rounded-full',
                'border border-brand-dark-border bg-brand-dark-card/70 backdrop-blur-sm',
                'text-gray-400 transition-all duration-200',
                brandClass,
              ].join(' ')}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden={true} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}