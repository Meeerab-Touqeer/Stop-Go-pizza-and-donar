import jwt from 'jsonwebtoken';
import { getStore } from '../services/store.js';

const hits = new Map();

export function signUser(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'dev-stopandgo-secret',
    { expiresIn: '7d' },
  );
}

export function limit(key, max, windowMs) {
  return (req, res, next) => {
    const id = `${key}:${req.ip}`;
    const now = Date.now();
    const bucket = (hits.get(id) || []).filter((time) => now - time < windowMs);
    if (bucket.length >= max) {
      return res.status(429).json({ error: 'Too many attempts. Wait a moment and try again.' });
    }
    bucket.push(now);
    hits.set(id, bucket);
    next();
  };
}

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Sign in required.' });
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      req.user = await getStore().verifyAccessToken(token);
      return next();
    }
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-stopandgo-secret');
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Sign in again.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access only.' });
  next();
}
