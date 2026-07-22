/**
 * Cloudflare Turnstile verifier — env-gated so dev/CI never blocks.
 *
 * When TURNSTILE_SECRET_KEY is set, the route hits
 * https://challenges.cloudflare.com/turnstile/v0/siteverify and verifies the
 * token signed by the client widget.
 *
 * When the env var is missing (local dev, smoke tests, CI), the verifier
 * returns verified=true UNLESS the dev test token 'XXXX.DUMMY.TOKEN.XXXX'
 * is provided — that lets E2E tests exercise the rejection branch without
 * hitting the Cloudflare endpoint.
 */

export interface TurnstileVerifyResult {
  verified: boolean;
  reason?: string;
  hostname?: string;
}

interface TurnstileSiteverifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

const SECRET = process.env.TURNSTILE_SECRET_KEY;
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const DEV_FAIL_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';

export async function verifyTurnstile(token: string | undefined | null): Promise<TurnstileVerifyResult> {
  if (!token) return { verified: false, reason: 'missing-token' };

  // Dev mode: explicitly bad token triggers the failure branch so tests can
  // exercise rejection paths.
  if (!SECRET) {
    if (token === DEV_FAIL_TOKEN) return { verified: false, reason: 'dev-dummy-token' };
    return { verified: true, reason: 'dev-mode-no-secret' };
  }

  try {
    const body = new URLSearchParams({ secret: SECRET, response: token });
    const resp = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!resp.ok) {
      return { verified: false, reason: `http-${resp.status}` };
    }
    const data = (await resp.json()) as TurnstileSiteverifyResponse;
    if (!data.success) {
      return {
        verified: false,
        reason: data['error-codes']?.join(',') ?? 'siteverify-false',
      };
    }
    return { verified: true, hostname: data.hostname };
  } catch (err) {
    return { verified: false, reason: `fetch-failed:${(err as Error).message}` };
  }
}

/** Convenience: SHA-256 hash an IP for GDPR-minimal logging. */
export async function hashIp(ip: string): Promise<string> {
  const enc = new TextEncoder().encode(ip);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
