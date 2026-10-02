import { validateGtpsSecret } from '../../lib/auth';
import { flushServerCache } from '../../lib/redis';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authHeader = req.headers['x-admin-secret'] || req.headers['authorization'];
  const cleanHeader = authHeader ? String(authHeader).replace(/^Bearer\s+/i, '').trim() : undefined;
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const provided = cleanHeader || body?.secret;

  if (!validateGtpsSecret(provided)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Secret' });
  }

  try {
    await flushServerCache();
    return res.status(200).json({
      success: true,
      message: 'Server status cache in Redis has been flushed successfully.',
      status: 'OFFLINE',
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
