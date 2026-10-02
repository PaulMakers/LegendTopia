import { validateGtpsSecret } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const secret = body?.secret;

    if (!validateGtpsSecret(secret)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid GTPS Secret' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Authentication successful', token: secret }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Bad request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
