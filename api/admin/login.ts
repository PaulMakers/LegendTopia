import { validateGtpsSecret } from '../../lib/auth';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const secret = body?.secret;

  if (!validateGtpsSecret(secret)) {
    return res.status(401).json({ success: false, error: 'Invalid GTPS Secret' });
  }

  return res.status(200).json({
    success: true,
    message: 'Authentication successful',
    token: secret,
  });
}
