import { validateGtpsSecret } from '../../lib/auth';
import { saveBroadcast, clearBroadcast } from '../../lib/redis';
import { BroadcastMessage } from '../../lib/types';

function checkAuth(req: any): boolean {
  const authHeader = req.headers['x-admin-secret'] || req.headers['authorization'];
  const cleanHeader = authHeader ? String(authHeader).replace(/^Bearer\s+/i, '').trim() : undefined;
  const bodySecret = req.body?.secret;
  const provided = cleanHeader || bodySecret;
  return validateGtpsSecret(provided);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  req.body = body;

  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Secret' });
  }

  if (req.method === 'POST') {
    try {
      const { message, type = 'announcement', active = true, author = 'Admin' } = body || {};
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
      return res.status(200).json({
        success: true,
        broadcast,
        message: 'Broadcast updated successfully',
      });
    } catch {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await clearBroadcast();
      return res.status(200).json({ success: true, message: 'Broadcast cleared successfully' });
    } catch {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
