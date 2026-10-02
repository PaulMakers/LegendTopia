import { getServerData } from '../lib/redis';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    return res.status(200).json({
      success: true,
      server: {
        status,
      },
    });
  } catch {
    return res.status(200).json({
      success: false,
      server: {
        status: 'offline',
      },
    });
  }
}
