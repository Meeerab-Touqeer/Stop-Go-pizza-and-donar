import bcrypt from 'bcryptjs';
import { getStore } from '../services/store.js';
import { limit, requireAuth, signUser } from '../middleware/auth.js';
import { loginSchema, parse, registerSchema } from '../validation/schemas.js';

export const authLimit = limit('auth', 12, 10 * 60 * 1000);

export async function register(req, res) {
  const body = parse(registerSchema, req.body);
  const store = getStore();
  const existing = await store.findUserByEmail(body.email);
  if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });

  if (store.mode === 'supabase') {
    const user = await store.createUser(body);
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
    const signed = await client.auth.signInWithPassword({ email: body.email, password: body.password });
    if (signed.error || !signed.data.session) return res.status(201).json({ token: null, user });
    return res.status(201).json({ token: signed.data.session.access_token, user });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await store.createUser({
    name: body.name,
    email: body.email.toLowerCase(),
    phone: body.phone,
    role: 'customer',
    passwordHash,
  });
  res.status(201).json({ token: signUser(user), user });
}

export async function login(req, res) {
  const body = parse(loginSchema, req.body);
  const store = getStore();

  if (store.mode === 'supabase') {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
    const signed = await client.auth.signInWithPassword({ email: body.email, password: body.password });
    if (signed.error) return res.status(401).json({ error: 'Email or password is incorrect.' });
    const user = await store.verifyAccessToken(signed.data.session.access_token);
    return res.json({ token: signed.data.session.access_token, user });
  }

  const record = await store.findUserByEmail(body.email);
  if (!record?.passwordHash) return res.status(401).json({ error: 'Email or password is incorrect.' });
  const match = await bcrypt.compare(body.password, record.passwordHash);
  if (!match) return res.status(401).json({ error: 'Email or password is incorrect.' });
  const { passwordHash, ...user } = record;
  res.json({ token: signUser(user), user });
}

export async function session(req, res) {
  const accessToken = req.body?.accessToken;
  if (!accessToken) return res.status(400).json({ error: 'Missing access token.' });
  const store = getStore();
  if (store.mode !== 'supabase') return res.status(400).json({ error: 'Google sign-in needs Supabase keys.' });
  const user = await store.verifyAccessToken(accessToken);
  res.json({ token: accessToken, user });
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export const meMiddleware = requireAuth;
