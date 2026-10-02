import { getBroadcast } from '../../../lib/redis';

export async function GET() {
  try {
    const broadcast = await getBroadcast();
    return new Response(JSON.stringify({ success: true, broadcast }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, broadcast: null }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
