import { getServerData } from '../../../lib/redis';

/**
 * Handler GET /app/api/ping
 *
 * Endpoint ringkas untuk kompatibilitas frontend lama atau health-check.
 * Response: { success: true, server: { status: "online" | "stale" | "offline" } }
 */
export async function GET(): Promise<Response> {
  try {
    const data = await getServerData();
    const lastHeartbeat = data?.lastHeartbeat;
    const diffSeconds = lastHeartbeat
      ? Math.max(0, Math.floor((Date.now() - lastHeartbeat) / 1000))
      : 999999;

    let status = 'offline';
    if (lastHeartbeat) {
      if (diffSeconds < 60) {
        status = 'online';
      } else if (diffSeconds <= 180) {
        status = 'stale';
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        server: {
          status,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        server: {
          status: 'offline',
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
