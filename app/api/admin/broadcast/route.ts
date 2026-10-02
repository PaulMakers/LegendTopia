import { validateGtpsSecret } from '../../../../lib/auth';
import { saveBroadcast, clearBroadcast } from '../../../../lib/redis';
import { BroadcastMessage } from '../../../../lib/types';

function checkAuth(request: Request, bodySecret?: string): boolean {
  const authHeader = request.headers.get('x-admin-secret') || request.headers.get('authorization');
  const cleanHeader = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : undefined;
  const provided = cleanHeader || bodySecret;
  return validateGtpsSecret(provided);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!checkAuth(request, body?.secret)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized: Invalid Admin Secret' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { message, type = 'announcement', active = true, author = 'Admin' } = body;
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Message text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const broadcast: BroadcastMessage = {
      id: Date.now().toString(),
      message: message.trim(),
      type,
      active: Boolean(active),
      createdAt: new Date().toISOString(),
      author,
    };

    await saveBroadcast(broadcast);

    return new Response(
      JSON.stringify({ success: true, broadcast, message: 'Broadcast updated successfully' }),
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

export async function DELETE(request: Request) {
  try {
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized: Invalid Admin Secret' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await clearBroadcast();

    return new Response(JSON.stringify({ success: true, message: 'Broadcast cleared successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
