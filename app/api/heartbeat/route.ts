import { validateGtpsSecret } from '../../../lib/auth';
import { saveServerHeartbeat } from '../../../lib/redis';
import { HeartbeatPayload, StoredServerData, Player } from '../../../lib/types';

/**
 * Handler POST /app/api/heartbeat
 *
 * Menerima sinyal heartbeat dari script Lua GTPS Cloud.
 * - Memvalidasi secret secara timing-safe
 * - Memvalidasi array pemain: maksimal 500 item, panjang nama maks 30 karakter
 * - Menyimpan data ke Redis key "gtps:status" dengan TTL 180 detik
 * - Mengembalikan response: { ok: true, received: N }
 */
export async function POST(request: Request): Promise<Response> {
  try {
    let body: HeartbeatPayload;
    try {
      body = (await request.json()) as HeartbeatPayload;
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: 'Format JSON body tidak valid' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Ambil secret dari header (X-Soft-Authenticate-Key / Authorization) atau field body
    const headerSecret =
      request.headers.get('x-soft-authenticate-key') ||
      request.headers.get('authorization');
    const cleanHeaderSecret = headerSecret
      ? headerSecret.replace(/^Bearer\s+/i, '').trim()
      : undefined;
    const providedSecret = body?.secret || cleanHeaderSecret;

    // Validasi secret dengan metode timing-safe
    if (!validateGtpsSecret(providedSecret)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized: Kunci rahasia GTPS tidak valid' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validasi input: field players harus bertipe array jika disertakan
    const rawPlayers = body.players ?? [];
    if (!Array.isArray(rawPlayers)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Field players harus berupa array' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validasi batas maksimal 500 pemain
    if (rawPlayers.length > 500) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Maksimal jumlah pemain dalam satu heartbeat adalah 500' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validasi dan normalisasi tiap nama pemain (maks 30 karakter)
    const normalizedPlayers: Player[] = [];
    for (const p of rawPlayers) {
      if (typeof p === 'string') {
        const trimmed = p.trim();
        if (trimmed.length > 30) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: `Nama pemain '${trimmed.slice(0, 15)}...' melebihi batas 30 karakter`,
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        normalizedPlayers.push({ name: trimmed, world: 'MAIN' });
      } else if (p && typeof p === 'object' && typeof p.name === 'string') {
        const trimmedName = p.name.trim();
        if (trimmedName.length > 30) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: `Nama pemain '${trimmedName.slice(0, 15)}...' melebihi batas 30 karakter`,
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        normalizedPlayers.push({
          name: trimmedName,
          world: p.world ? String(p.world).trim().slice(0, 30) : 'MAIN',
          level: typeof p.level === 'number' ? p.level : 1,
          role: p.role ? String(p.role).trim() : undefined,
        });
      }
    }

    const now = Date.now();

    // Hitung uptime dalam bentuk numerik detik
    let uptimeSeconds = 0;
    if (typeof body.uptime === 'number') {
      uptimeSeconds = Math.max(0, Math.floor(body.uptime));
    } else if (typeof body.uptime === 'string') {
      const parsed = parseInt(body.uptime, 10);
      if (!isNaN(parsed)) uptimeSeconds = parsed;
    }

    // Format uptime teks jika tidak disediakan
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const formattedUptime =
      typeof body.uptime === 'string' && isNaN(Number(body.uptime))
        ? body.uptime
        : `${hours}h ${minutes}m`;

    const serverIp = process.env.GTPS_SERVER_IP || '15.235.227.241';

    const storedData: StoredServerData = {
      status: 'ONLINE',
      serverName: body.serverName?.trim() || 'LegendTopia',
      playerCount:
        typeof body.playerCount === 'number' ? body.playerCount : normalizedPlayers.length,
      maxPlayers: typeof body.maxPlayers === 'number' ? body.maxPlayers : 1000,
      players: normalizedPlayers,
      worldCount: typeof body.worldCount === 'number' ? body.worldCount : 1,
      uptime: formattedUptime,
      uptimeSeconds,
      version: body.version?.trim() || '4.45',
      lastHeartbeat: now,
      lastHeartbeatIso: new Date(now).toISOString(),
      ip: serverIp,
      port: 17091,
    };

    // Simpan ke Redis key "gtps:status" dengan TTL 180 detik
    await saveServerHeartbeat(storedData);

    const receivedCount = storedData.playerCount;

    return new Response(
      JSON.stringify({
        ok: true,
        received: receivedCount,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('[Heartbeat Error]:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Gagal memproses sinyal heartbeat' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
