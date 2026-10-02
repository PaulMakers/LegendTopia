import { validateGtpsSecret } from '../../../../lib/auth';
import { flushServerCache } from '../../../../lib/redis';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-admin-secret') || request.headers.get('authorization');
    const cleanHeader = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : undefined;
    let bodySecret: string | undefined;

    try {
      const body = await request.json();
      bodySecret = body?.secret;
    } catch {
      // Body is optional
    }

    const provided = cleanHeader || bodySecret;
    if (!validateGtpsSecret(provided)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized: Invalid Admin Secret' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await flushServerCache();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Server status cache in Redis has been flushed successfully.',
        status: 'OFFLINE',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
