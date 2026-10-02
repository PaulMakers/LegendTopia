import { getServerData } from '../../../lib/redis';
import { StatusResponse, ServerStatus } from '../../../lib/types';

/**
 * Handler GET /app/api/status
 *
 * Mengambil status server terbaru dari Redis.
 * Logika status berdasarkan umur heartbeat:
 * - Heartbeat < 60 detik      → online: true, stale: false (ONLINE)
 * - Heartbeat 60 - 180 detik   → online: false, stale: true (STALE)
 * - Heartbeat > 180 detik / null → online: false, stale: false (OFFLINE)
 *
 * Header: Cache-Control: no-store
 */
export async function GET(): Promise<Response> {
  try {
    const data = await getServerData();
    const now = Date.now();

    // Hitung umur sinyal heartbeat dalam detik
    const lastHeartbeat = data?.lastHeartbeat;
    const diffSeconds = lastHeartbeat
      ? Math.max(0, Math.floor((now - lastHeartbeat) / 1000))
      : 999999;

    let online = false;
    let stale = false;
    let serverStatus: ServerStatus = 'OFFLINE';

    if (lastHeartbeat) {
      if (diffSeconds < 60) {
        online = true;
        stale = false;
        serverStatus = 'ONLINE';
      } else if (diffSeconds <= 180) {
        online = false;
        stale = true;
        serverStatus = 'STALE';
      } else {
        online = false;
        stale = false;
        serverStatus = 'OFFLINE';
      }
    }

    // Hitung uptime dalam detik
    let uptimeSeconds = 0;
    if (online || stale) {
      if (typeof data?.uptimeSeconds === 'number' && data.uptimeSeconds > 0) {
        uptimeSeconds = data.uptimeSeconds + diffSeconds;
      } else {
        uptimeSeconds = diffSeconds;
      }
    }

    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeFormatted =
      online || stale
        ? data?.uptime || `${hours}h ${minutes}m`
        : '0h 0m';

    const serverIp = process.env.GTPS_SERVER_IP || data?.ip || '15.235.227.241';
    const serverPort = data?.port || 17091;

    const responsePayload: StatusResponse = {
      success: true,
      status: serverStatus,
      online,
      stale,
      uptimeSeconds,
      server: {
        name: data?.serverName || 'LegendTopia',
        status: serverStatus,
        online,
        stale,
        playerCount: online || stale ? (data?.playerCount ?? 0) : 0,
        maxPlayers: data?.maxPlayers || 1000,
        players: online || stale ? (data?.players || []) : [],
        worldCount: online || stale ? (data?.worldCount || 0) : 0,
        uptime: uptimeFormatted,
        uptimeSeconds,
        version: data?.version || '4.45',
        ip: serverIp,
        port: serverPort,
        lastSeenSecondsAgo: diffSeconds,
        lastHeartbeatIso: data?.lastHeartbeatIso || '',
      },
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Status Error]:', error);
    return new Response(
      JSON.stringify({
        success: false,
        status: 'OFFLINE',
        online: false,
        stale: false,
        uptimeSeconds: 0,
        error: 'Gagal mengambil data status server',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
