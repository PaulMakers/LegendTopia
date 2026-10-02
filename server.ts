import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateGtpsSecret } from './lib/auth';
import {
  saveServerHeartbeat,
  getServerData,
  computeServerStatus,
  saveBroadcast,
  getBroadcast,
  clearBroadcast,
  flushServerCache,
} from './lib/redis';
import {
  HeartbeatPayload,
  StoredServerData,
  StatusResponse,
  BroadcastMessage,
  Player,
  ServerStatus,
} from './lib/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// CORS & Preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Seed an initial demo heartbeat so the site starts in a lively, testable state immediately if empty
(async () => {
  const existing = await getServerData();
  if (!existing) {
    const demoHeartbeat: StoredServerData = {
      status: 'ONLINE',
      serverName: 'LegendTopia',
      playerCount: 142,
      maxPlayers: 1000,
      players: [
        { name: 'DrLegend', world: 'START', level: 120, role: 'Owner' },
        { name: 'EmeraldKing', world: 'TRADE', level: 85, role: 'Admin' },
        { name: 'PixelPro', world: 'BUYGHC', level: 64 },
        { name: 'RayhanGT', world: 'FARM', level: 52 },
        { name: 'SkyGrower', world: 'BFG', level: 41 },
        { name: 'VortexX', world: 'CASINO', level: 99 },
        { name: 'Ahmad_ID', world: 'START', level: 33 },
        { name: 'ZeusTopia', world: 'PARKOUR', level: 77 },
        { name: 'IndoPride', world: 'VEND', level: 29 },
        { name: 'GrowMaster', world: 'LEGEND', level: 110, role: 'Mod' },
      ],
      worldCount: 38,
      uptime: '14d 6h 32m',
      version: '4.45',
      lastHeartbeat: Date.now(),
      lastHeartbeatIso: new Date().toISOString(),
      ip: '15.235.227.241',
      port: 17091,
    };
    await saveServerHeartbeat(demoHeartbeat);
  }
})();

// POST /api/heartbeat - GTPS Cloud Lua Heartbeat receiver
app.post('/api/heartbeat', async (req, res) => {
  try {
    const body: HeartbeatPayload = req.body;
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
          return res.status(400).json({ ok: false, error: `Player name exceeds 30 characters limit` });
        }
        normalizedPlayers.push({ name: trimmed, world: 'MAIN' });
      } else if (p && typeof p === 'object' && typeof p.name === 'string') {
        const trimmed = p.name.trim();
        if (trimmed.length > 30) {
          return res.status(400).json({ ok: false, error: `Player name exceeds 30 characters limit` });
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

    return res.json({
      ok: true,
      received: storedData.playerCount,
    });
  } catch (error) {
    console.error('Server heartbeat error:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// GET /api/status - Browser polling endpoint
app.get('/api/status', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const data = await getServerData();
    const now = Date.now();

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

    const response: StatusResponse = {
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

    return res.json(response);
  } catch (error) {
    console.error('API Status error:', error);
    return res.status(500).json({ success: false, status: 'OFFLINE', online: false, stale: false, uptimeSeconds: 0 });
  }
});

// GET /api/ping - Simple ping endpoint
app.get('/api/ping', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
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

    return res.json({
      success: true,
      server: {
        status,
      },
    });
  } catch {
    return res.json({
      success: false,
      server: {
        status: 'offline',
      },
    });
  }
});

// GET /api/ios - Surge 5 Configuration download
app.get('/api/ios', (req, res) => {
  const serverIp = process.env.GTPS_SERVER_IP || '15.235.227.241';
  const surgeConfig = [
    '#!MANAGED-CONFIG https://legendtopia.vercel.app/api/ios interval=86400 strict=false',
    '# ==========================================',
    '# LegendTopia GTPS - Surge 5 Configuration',
    '# ==========================================',
    '',
    '[General]',
    'loglevel = notify',
    'skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, localhost, *.local',
    'bypass-tun = 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12',
    'dns-server = 1.1.1.1, 8.8.8.8',
    '',
    '[Host]',
    `growtopia1.com = ${serverIp}`,
    `growtopia2.com = ${serverIp}`,
    `www.growtopia1.com = ${serverIp}`,
    `www.growtopia2.com = ${serverIp}`,
    '',
    '[Rule]',
    'FINAL,DIRECT',
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="LegendTopia-Surge.conf"');
  res.send(surgeConfig);
});

// Admin Authentication Helper Middleware
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const secretHeader = (req.headers['x-admin-secret'] || req.headers['authorization']) as string | undefined;
  const cleanHeader = secretHeader ? secretHeader.replace(/^Bearer\s+/i, '').trim() : undefined;
  const provided = cleanHeader || req.body?.secret || (req.query?.secret as string);

  if (!validateGtpsSecret(provided)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Secret' });
  }
  next();
}

// POST /api/admin/login - Verify admin using GTPS_SECRET
app.post('/api/admin/login', (req, res) => {
  const secret = req.body?.secret;
  if (!validateGtpsSecret(secret)) {
    return res.status(401).json({ success: false, error: 'Invalid GTPS Secret' });
  }
  return res.json({ success: true, message: 'Authentication successful', token: secret });
});

// GET /api/broadcast - Public broadcast banner
app.get('/api/broadcast', async (req, res) => {
  try {
    const broadcast = await getBroadcast();
    return res.json({ success: true, broadcast });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to fetch broadcast' });
  }
});

// POST /api/admin/broadcast - Set/Update broadcast banner
app.post('/api/admin/broadcast', requireAdminAuth, async (req, res) => {
  try {
    const { message, type = 'announcement', active = true, author = 'Admin' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message text is required' });
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
    return res.json({ success: true, broadcast, message: 'Broadcast updated successfully' });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to save broadcast' });
  }
});

// DELETE /api/admin/broadcast - Clear broadcast
app.delete('/api/admin/broadcast', requireAdminAuth, async (req, res) => {
  try {
    await clearBroadcast();
    return res.json({ success: true, message: 'Broadcast cleared successfully' });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to clear broadcast' });
  }
});

// POST /api/admin/refresh - Force-refresh server status cached in Redis
app.post('/api/admin/refresh', requireAdminAuth, async (req, res) => {
  try {
    await flushServerCache();
    return res.json({
      success: true,
      message: 'Server status cache in Redis has been flushed successfully.',
      status: 'OFFLINE',
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to flush server cache' });
  }
});

// Serve frontend with Vite in development or static dist in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LegendTopia server running at http://0.0.0.0:${PORT} (env: ${isProduction ? 'prod' : 'dev'})`);
  });
}

startServer();
