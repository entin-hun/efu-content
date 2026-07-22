'use client';

import { useState } from 'react';

/**
 * YouTube embed-ready hero tile.
 *
 * Renders an instant poster (channel avatar + LIVE badge) until the user
 * clicks "Play". The iframe is mounted only after consent so the LCP is not
 * blocked by third-party JS. Lazy-mounted via dynamic-import boundary.
 *
 * The live URL is configurable per event via `liveUrl` prop (defaults to
 * the EFU YouTube channel live tab).
 */

interface Props {
  liveUrl?: string;
  channelHandle?: string; // for the poster fallback label
  /** aria-label override for the play trigger (defaults to HU). */
  ariaLabel?: string;
  /** Small caption shown beneath the play trigger (defaults to HU). */
  hint?: string;
  /** Small caption shown beneath the play trigger (defaults to HU). */
  liveLabel?: string;
}

function extractChannelId(url: string): { type: 'channel' | 'live' | 'unknown'; id: string } {
  try {
    const u = new URL(url);
    if (u.pathname.startsWith('/channel/')) {
      return { type: 'channel', id: u.pathname.split('/')[2] ?? '' };
    }
    if (u.pathname.startsWith('/@')) {
      return { type: 'channel', id: u.pathname.slice(1) };
    }
    if (u.pathname === '/watch') {
      return { type: 'live', id: u.searchParams.get('v') ?? '' };
    }
    if (u.pathname.endsWith('/live')) {
      return { type: 'live', id: u.pathname.split('/')[1] ?? '' };
    }
    return { type: 'unknown', id: '' };
  } catch {
    return { type: 'unknown', id: '' };
  }
}

function toEmbedSrc(liveUrl: string): string {
  const info = extractChannelId(liveUrl);
  if (info.type === 'live' && info.id) {
    return `https://www.youtube.com/embed/${info.id}?autoplay=1&rel=0&modestbranding=1`;
  }
  // Channel handle / unknown — fall back to channel live tab via embed
  // (YouTube serves channel live streams through this format).
  return `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(info.id)}&autoplay=1&rel=0&modestbranding=1`;
}

export function HeroYouTubeEmbed({
  liveUrl = 'https://www.youtube.com/@EliteFightUniverse/live',
  channelHandle = '@EliteFightUniverse',
  ariaLabel = 'Élő közvetítés indítása',
  hint = 'Kattints az élő adás indításához',
  liveLabel = 'LIVE',
}: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-brand-dark-border bg-black shadow-2xl">
      {!playing ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={ariaLabel}
          className="group absolute inset-0 flex flex-col items-center justify-center text-white"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at center, rgba(220,38,38,0.25) 0%, rgba(0,0,0,0.85) 70%), linear-gradient(180deg, #0A0A0A 0%, #1a0000 100%)',
          }}
        >
          {/* Animated ring */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-brand-red flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="absolute inset-0 rounded-full border-2 border-brand-red animate-ping opacity-50" />
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1"
              aria-hidden={true}
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-red text-white text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {liveLabel}
            </span>
            <span className="text-xs sm:text-sm text-gray-300 font-mono">
              {channelHandle}
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-500 uppercase tracking-widest">
            {hint}
          </p>
        </button>
      ) : (
        <iframe
          src={toEmbedSrc(liveUrl)}
          title="EFU Élő közvetítés"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  );
}