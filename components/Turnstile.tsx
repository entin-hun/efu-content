'use client';

/**
 * Cloudflare Turnstile — thin wrapper that becomes a no-op when no
 * site key is configured (dev/CI). Always exposes getToken() /
 * resetToken() so the form can call them without conditionals.
 *
 * When NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, the official widget script
 * is appended once; on submit we read the response token.
 *
 * The widget data-cf-turnkey is just our convention; Turnstile uses
 * data-sitekey.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface TurnstileHandle {
  getToken(): string | null;
  reset(): void;
}

interface Props {
  siteKey?: string | undefined;
}

interface TurnstileRenderFn {
  (container: HTMLElement, options: { sitekey: string; callback?: (t: string) => void; 'expired-callback'?: () => void }): string | undefined;
  reset?: (widgetId?: string) => void;
  remove?: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileRenderFn & { render?: TurnstileRenderFn };
  }
}

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

export const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile(
  { siteKey },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const tokenRef = useRef<string | null>(null);
  const [, setTick] = useState(0); // forces re-render on expiry

  useEffect(() => {
    if (!siteKey) return;
    if (typeof window === 'undefined') return;

    function render() {
      if (!containerRef.current || !window.turnstile?.render) return;
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey!,
        callback: (token: string) => {
          tokenRef.current = token;
          setTick((n) => n + 1);
        },
        'expired-callback': () => {
          tokenRef.current = null;
          setTick((n) => n + 1);
        },
      });
      widgetIdRef.current = id ?? undefined;
    }

    if (window.turnstile?.render) {
      render();
      return;
    }

    const existing = document.querySelector(`script[src="${TURNSTILE_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', render);
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [siteKey]);

  useImperativeHandle(ref, () => ({
    getToken: () => (siteKey ? tokenRef.current : 'dev-no-turnstile'),
    reset: () => {
      tokenRef.current = null;
      if (siteKey && widgetIdRef.current && window.turnstile?.reset) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }));

  if (!siteKey) {
    // Dev fallback: invisible so the layout stays identical.
    return (
      <div
        data-dev-turnstile="missing"
        aria-hidden="true"
        className="h-0 opacity-0 pointer-events-none"
      />
    );
  }

  return <div ref={containerRef} className="cf-turnstile" />;
});
