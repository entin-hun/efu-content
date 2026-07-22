'use client';

import { useState } from 'react';

/**
 * Lightweight "share" panel for the fighter profile.
 *
 * The page is server-rendered with full OpenGraph + Twitter metadata,
 * so any link the user pastes into a chat/feed renders a rich preview
 * automatically. We expose one extra "copy link" affordance so people
 * on LinkedIn, email, etc. can grab the URL without the share-sheet
 * dance.
 */
export function SharePanelClient({
  name,
  slug,
  tShare,
}: {
  name: string;
  slug: string;
  tShare: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/harcosok/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Some browsers block clipboard outside secure contexts; fall back to manual.
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="card-dark rounded-2xl p-5">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">
        {tShare}
      </h2>
      <p className="text-gray-300 text-sm mb-3">
        Oszd meg {name} profilját — a link már tartalmazza a harcos fotóját és nevét is
        (OpenGraph preview).
      </p>
      <button
        type="button"
        onClick={copyUrl}
        className="w-full gradient-red text-white font-bold uppercase text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity"
      >
        {copied ? '✓ Link másolva' : 'Link másolása'}
      </button>
    </div>
  );
}
