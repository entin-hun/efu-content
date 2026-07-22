import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/webhooks/stripe
 *
 * In production:
 *   1. Validate the Stripe-Signature header using your webhook secret
 *   2. Parse the event type
 *   3. On `checkout.session.completed`, update the purchase row in the DB
 *
 * Security: ALWAYS verify the signature before trusting the payload.
 * Never grant access based on an unverified request body.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  // --- Production signature verification (commented out for demo) ---
  // let event: Stripe.Event;
  // try {
  //   event = stripe.webhooks.constructEvent(
  //     rawBody,
  //     signature!,
  //     process.env.STRIPE_WEBHOOK_SECRET!
  //   );
  // } catch (err) {
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  // }

  // --- Mock: parse body directly (demo only — NOT for production) ---
  if (!rawBody) {
    return NextResponse.json({ error: 'Empty body' }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const metadata = session.metadata as { userId?: string; seasonId?: string } | undefined;

      if (!metadata?.userId || !metadata?.seasonId) {
        console.warn('[webhook] Missing metadata on session', session);
        return NextResponse.json({ received: true });
      }

      // --- Production DB update (commented out for demo) ---
      // await db.purchases.upsert({
      //   where: { userId_seasonId: { userId: metadata.userId, seasonId: metadata.seasonId } },
      //   update: { status: 'paid', expiresAt: new Date('2026-12-31') },
      //   create: {
      //     userId: metadata.userId,
      //     seasonId: metadata.seasonId,
      //     status: 'paid',
      //     expiresAt: new Date('2026-12-31'),
      //   },
      // });

      console.log(`[webhook] Access granted: user=${metadata.userId} season=${metadata.seasonId}`);
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      console.warn('[webhook] Payment failed:', pi);
      break;
    }

    default:
      console.log(`[webhook] Unhandled event type: ${event.type}`);
  }

  // Always return 200 quickly so Stripe doesn't retry unnecessarily
  return NextResponse.json({ received: true });
}
