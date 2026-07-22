import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware wrappers around next/link and next/navigation primitives.
 *
 * Why wrap? Because next-intl expects <Link href="/pricing"> to be rewritten
 * as <Link href="/hu/pricing"> automatically. Using the raw next/link
 * everywhere in the codebase would silently drop the locale prefix on the
 * `<Link>` calls, which would then 404.
 *
 * Usage:
 *   import { Link, useRouter, usePathname } from '@/i18n/navigation';
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);