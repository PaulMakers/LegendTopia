import { validateGtpsSecret } from '../lib/auth';
import { saveServerHeartbeat } from '../lib/redis';
import { HeartbeatPayload, StoredServerData, Player } from '../lib/types';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Soft-Authenticate-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body: HeartbeatPayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const headerSecret = (req.headers['x-soft-authenticate-key'] || req.headers['authorization']) as string | undefined;
    const cleanHeaderSecret = headerSecret ? headerSecret.replace(/^Bearer\s+/i, '').trim() : undefined;
    const providedSecret = body?.secret || cleanHeaderSecret;

    if (!providedSecret) {
      return res.status(400).json({ ok: false, error: 'Missing secret payload or header' });
    }

    if (!validateGtpsSecret(providedSecret)) {
      return res.status(401).json({ ok: false, error: 'Unauthorized: Invalid GTPS secret' });
    }

    const rawPlayers = body.players ?? [];
    if (!Array.isArray(rawPlayers)) {
      return res.status(400).json({ ok: false, error: 'Field players must be an array' });
    }

    if (rawPlayers.length > 500) {
      return res.status(400).json({ ok: false, error: 'Maximum 500 players allowed per heartbeat' });
    }

    const normalizedPlayers: Player[] = [];
    for (const p of rawPlayers) {
      if (typeof p === 'string') {
        const trimmed = p.trim();
        if (trimmed.length > 30) {
          return res.status(400).json({ ok: false, error: 'Player name exceeds 30 characters limit' });
        }
        normalizedPlayers.push({ name: trimmed, world: 'MAIN' });
      } else if (p && typeof p === 'object' && typeof p.name === 'string') {
        const trimmed = p.name.trim();
        if (trimmed.length > 30) {
          return res.status(400).json({ ok: false, error: 'Player name exceeds 30 characters limit' });
        }
        normalizedPlayers.push({
          name: trimmed,
          world: p.world ? String(p.world).trim().slice(0, 30) : 'MAIN',
          level: typeof p.level === 'number' ? p.level : 1,
          role: p.role ? String(p.role).trim() : undefined,
        });
      }
    }

    const now = Date.now();
    let uptimeSeconds = 0;
    if (typeof body.uptime === 'number') {
      uptimeSeconds = Math.max(0, Math.floor(body.uptime));
    } else if (typeof body.uptime === 'string') {
      const parsed = parseInt(body.uptime, 10);
      if (!isNaN(parsed)) uptimeSeconds = parsed;
    }

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
      playerCount: typeof body.playerCount === 'number' ? body.playerCount : normalizedPlayers.length,
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

    await saveServerHeartbeat(storedData);

    return res.status(200).json({
      ok: true,
      received: storedData.playerCount,
    });
  } catch {
    return res.status(500).json({ ok: false, error: 'Failed to process heartbeat' });
  }
}
