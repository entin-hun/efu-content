import { NextRequest, NextResponse } from 'next/server';
import {
  validateContact,
  isContactOk,
  type ContactFormInput,
} from '@/lib/validation';
import { contactStore, type ContactRecord } from '@/lib/db/contact';
import { verifyTurnstile, hashIp } from '@/lib/bot-protection/turnstile';
import { email, ADMIN_EMAIL, FROM_EMAIL } from '@/lib/email';

export const runtime = 'nodejs'; // need fs for JSON store; swap to edge when Prisma lands

interface IncomingPayload extends ContactFormInput {
  locale?: string;
  turnstileToken?: string | null;
}

/**
 * POST /api/contact
 *
 * - Re-runs the shared contact validator (server is source of truth).
 * - Verifies Turnstile (skip when secret absent in dev; accepts dummy fail-token).
 * - Persists via the pluggable ContactStore.
 * - Sends two emails: admin notification + sender auto-reply.
 * - Returns { ok, id } on success or { ok:false, errors, message } on failure.
 */
export async function POST(request: NextRequest) {
  let body: IncomingPayload;
  try {
    body = (await request.json()) as IncomingPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const errors = validateContact(body);
  if (!isContactOk(errors)) {
    return NextResponse.json(
      { ok: false, errors, message: 'validation_failed' },
      { status: 422 }
    );
  }

  // Anti-bot layer.
  const ts = await verifyTurnstile(body.turnstileToken);
  if (!ts.verified) {
    return NextResponse.json(
      {
        ok: false,
        errors: [
          {
            field: 'message',
            code: 'required',
            message: 'turnstile_failed',
          },
        ],
        message: 'turnstile_failed',
        reason: ts.reason,
      },
      { status: 403 }
    );
  }

  // GDPR consent must be true (validator enforces it, double-check here).
  if (body.gdprConsent !== true) {
    return NextResponse.json(
      { ok: false, message: 'gdpr_consent_required' },
      { status: 422 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0';
  const ipHash = await hashIp(ip);
  const userAgent = request.headers.get('user-agent') ?? undefined;

  let record: ContactRecord;
  try {
    record = await contactStore.create({
      locale: body.locale ?? 'hu',
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      subject: String(body.subject).trim(),
      message: body.message.trim(),
      gdprConsent: true,
      gdprConsentAt: new Date().toISOString(),
      ipHash,
      userAgent,
      honeypotTriggered: false,
      turnstileVerified: true,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/contact] store.create failed:', err);
    return NextResponse.json(
      { ok: false, message: 'storage_failed' },
      { status: 500 }
    );
  }

  // Fire-and-await both emails. If either fails, we still return success
  // because the message is already stored — but log the failure loudly so
  // it surfaces in dev/admin triage.
  try {
    await email.send({
      to: ADMIN_EMAIL,
      from: FROM_EMAIL,
      subject: `[Kapcsolat] ${body.subject} — ${body.name}`,
      text:
        `Új kapcsolat űrlap beérkezés (${record.id})\n\n` +
        `Név: ${body.name}\n` +
        `E-mail: ${body.email}\n` +
        `Tárgy: ${body.subject}\n` +
        `Nyelv: ${body.locale ?? 'hu'}\n` +
        `Beküldve: ${record.createdAt}\n\n` +
        `--- Üzenet ---\n${body.message}\n\n` +
        `--- GDPR ---\nHozzájárulás: ${record.gdprConsentAt}\n` +
        `IP hash: ${ipHash}\n` +
        `UA: ${userAgent ?? '-'}\n`,
      category: 'admin-notification',
      relatedApplicationId: record.id,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/contact] admin notification failed:', err);
  }

  try {
    await email.send({
      to: body.email.trim(),
      from: FROM_EMAIL,
      subject: 'Köszönjük az üzeneted — EFU',
      text:
        `Szia ${body.name}!\n\n` +
        `Köszönjük, hogy írtál nekünk. Csapatunk átnézi az üzenetedet, ` +
        `és hamarosan jelentkezünk a megadott e-mail címen.\n\n` +
        `Tárgy: ${body.subject}\n` +
        `Beküldve: ${record.createdAt}\n` +
        `Hivatkozási azonosító: ${record.id}\n\n` +
        `Üdvözlettel,\nElite Fight Universe csapata\n`,
      category: 'auto-reply',
      relatedApplicationId: record.id,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/contact] auto-reply failed:', err);
  }

  return NextResponse.json({ ok: true, id: record.id });
}