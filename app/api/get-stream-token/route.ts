import { NextRequest, NextResponse } from 'next/server';

const STREAM_ID = process.env.CF_STREAM_ID ?? 'abc123def456789mock';
const TOKEN_TTL_SECONDS = 3600; // 1 hour

/**
 * GET /api/get-stream-token
 *
 * Security flow:
 *   1. Verify the user is authenticated (session cookie / JWT)
 *   2. Query the purchases table for an active, non-expired season pass
 *   3. If not found → 403
 *   4. If found → sign a short-lived Cloudflare Stream JWT and return it
 *
 * The signed URL prevents hotlinking: each token is time-limited and
 * tied to the specific stream ID. Users cannot share the raw stream URL.
 */
export async function GET(request: NextRequest) {
  // --- Production auth check (commented out for demo) ---
  // const session = await getServerSession(authOptions);  // NextAuth
  // const userId = session?.user?.id;
  // if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // --- Production DB check (commented out for demo) ---
  // const purchase = await db.purchases.findFirst({
  //   where: {
  //     userId,
  //     seasonId: 'Season_2026_1',
  //     status: 'paid',
  //     expiresAt: { gt: new Date() },
  //   },
  // });
  // if (!purchase) return NextResponse.json({ error: 'No active season pass' }, { status: 403 });

  // --- Production Cloudflare JWT signing (commented out for demo) ---
  // Uses RS256 with your Cloudflare Stream Signing Key (RSA private key)
  //
  // const payload = {
  //   sub: STREAM_ID,
  //   kid: process.env.CF_STREAM_KEY_ID!,
  //   exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  //   nbf: Math.floor(Date.now() / 1000) - 5,
  //   downloadable: false,
  // };
  // const token = await signJwt(payload, process.env.CF_STREAM_PRIVATE_KEY!);

  // --- Mock demo token ---
  const mockPayload = {
    sub: STREAM_ID,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    iat: Math.floor(Date.now() / 1000),
    mock: true,
  };

  // Base64-encode the mock payload as the token (not a real JWT for demo)
  const mockToken =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImNmLXN0cmVhbSJ9.' +
    Buffer.from(JSON.stringify(mockPayload)).toString('base64url') +
    '.MOCK_SIGNATURE';

  return NextResponse.json({
    token: mockToken,
    streamId: STREAM_ID,
    expiresIn: TOKEN_TTL_SECONDS,
    embedUrl: `https://customer-stream.cloudflarestream.com/embed/${STREAM_ID}?token=${mockToken}`,
  });
}
