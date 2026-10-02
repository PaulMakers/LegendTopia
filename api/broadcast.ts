import { getBroadcast } from '../lib/redis';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const broadcast = await getBroadcast();
    return res.status(200).json({ success: true, broadcast });
  } catch {
    return res.status(500).json({ success: false, broadcast: null });
  }
}
