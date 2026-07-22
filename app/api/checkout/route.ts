import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/checkout
 *
 * In production:
 *   1. Verify the authenticated user (e.g. via session cookie / Supabase Auth)
 *   2. Call Stripe to create a Checkout Session with metadata
 *   3. Return the Checkout Session URL
 *
 * Here: returns a mock checkout URL pointing to our local /checkout page.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = (body.userId as string) ?? 'demo-user-001';
    const seasonId = (body.seasonId as string) ?? 'Season_2026_1';

    // Validate inputs at the boundary
    if (typeof userId !== 'string' || typeof seasonId !== 'string') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // --- Production Stripe call (commented out for demo) ---
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'payment',
    //   currency: 'huf',
    //   line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    //   metadata: { userId, seasonId },
    //   success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/#pricing`,
    //   payment_method_types: ['card', 'paypal'],
    // });
    // return NextResponse.json({ url: session.url });

    // --- Mock response ---
    const origin = request.headers.get('origin') ?? 'http://localhost:3000';
    const mockSessionId = `cs_mock_${Date.now()}`;

    return NextResponse.json({
      url: `${origin}/checkout`,
      sessionId: mockSessionId,
      amount: 2500,
      currency: 'huf',
      metadata: { userId, seasonId },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
