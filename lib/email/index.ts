/**
 * Email provider — pluggable transport, dev-defaults to console logging.
 *
 * Today: writes to .data/email-outbox.json (visible in admin/E2E tests)
 *   and also logs to stdout in dev.
 * Tomorrow (when SMTP / Resend is chosen at L0): swap the `EmailProvider`
 *   implementation. Controller code keeps calling `send(...)`.
 *
 * Two email types per submission:
 *   1) Admin notification — sends to ADMIN_EMAIL (or support@).
 *   2) Auto-reply — sends to the applicant.
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface OutboundEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
  sentAt: string;
  category: 'admin-notification' | 'auto-reply';
  relatedApplicationId?: string;
}

export interface EmailProvider {
  send(email: Omit<OutboundEmail, 'id' | 'sentAt'>): Promise<OutboundEmail>;
}

const OUTBOX_FILE = path.join(process.cwd(), '.data', 'email-outbox.json');
const FROM = process.env.EMAIL_FROM ?? 'EFU <no-reply@elitefightuniverse.live>';
const ADMIN = process.env.ADMIN_EMAIL ?? 'applications@elitefightuniverse.live';

async function ensureOutbox(): Promise<void> {
  await fs.mkdir(path.dirname(OUTBOX_FILE), { recursive: true });
  try {
    await fs.access(OUTBOX_FILE);
  } catch {
    await fs.writeFile(OUTBOX_FILE, '[]', 'utf8');
  }
}

async function appendOutbox(record: OutboundEmail): Promise<void> {
  await ensureOutbox();
  const raw = await fs.readFile(OUTBOX_FILE, 'utf8');
  const list = JSON.parse(raw) as OutboundEmail[];
  list.push(record);
  await fs.writeFile(OUTBOX_FILE, JSON.stringify(list, null, 2), 'utf8');
}

class FileBackedEmailProvider implements EmailProvider {
  async send(email: Omit<OutboundEmail, 'id' | 'sentAt'>): Promise<OutboundEmail> {
    const record: OutboundEmail = {
      ...email,
      id: `em_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      sentAt: new Date().toISOString(),
    };
    await appendOutbox(record);
    // Dev visibility: stdout + audit log.
    // eslint-disable-next-line no-console
    console.log(
      `[email:${record.category}] -> ${record.to} | subject=${record.subject}`
    );
    return record;
  }

  /** Read-only helper used by the admin queue view. */
  async recent(limit = 50): Promise<OutboundEmail[]> {
    await ensureOutbox();
    const raw = await fs.readFile(OUTBOX_FILE, 'utf8');
    const list = JSON.parse(raw) as OutboundEmail[];
    return [...list].sort((a, b) => b.sentAt.localeCompare(a.sentAt)).slice(0, limit);
  }
}

export const email: FileBackedEmailProvider = new FileBackedEmailProvider();
export const ADMIN_EMAIL = ADMIN;
export const FROM_EMAIL = FROM;
