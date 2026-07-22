/**
 * Auth role gate — minimal dev stub.
 *
 * Today: reads a `role` cookie set by the dev tools (admin/dev panel).
 * Tomorrow (when L1-AUTH-RBAC at t_cbf10901 lands): replace with the real
 * `getServerSession()` + role lookup. The shape of `requireRole(roles)`
 * stays the same.
 */

export type Role =
  | 'guest'
  | 'user'
  | 'Rendszeradminisztrator'
  | 'Producer'
  | 'Reality szerkeszto'
  | 'Tartalomkeszito'
  | 'Marketing'
  | 'Moderator';

export const STAFF_ROLES: ReadonlySet<Role> = new Set<Role>([
  'Rendszeradminisztrator',
  'Producer',
  'Reality szerkeszto',
  'Tartalomkeszito',
  'Marketing',
  'Moderator',
]);

export const ADMIN_ROLES: ReadonlySet<Role> = new Set<Role>([
  'Rendszeradminisztrator',
  'Producer',
  'Reality szerkeszto',
]);

import { cookies } from 'next/headers';

export async function currentRole(): Promise<Role> {
  const c = await cookies();
  const r = c.get('efu_role')?.value as Role | undefined;
  if (r && (STAFF_ROLES.has(r) || r === 'user' || r === 'guest')) return r;
  return 'guest';
}

export async function requireRole(allowed: Role[] | ReadonlySet<Role>): Promise<{
  ok: true;
  role: Role;
} | { ok: false; reason: 'forbidden' }> {
  const role = await currentRole();
  const set = allowed instanceof Set ? allowed : new Set<Role>(allowed);
  if (!set.has(role)) return { ok: false, reason: 'forbidden' };
  return { ok: true, role };
}
