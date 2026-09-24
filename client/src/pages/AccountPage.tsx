import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { api } from '../services/api';
import { useAuth } from '../store/useAuth';

function browserSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function AccountPage() {
  const user = useAuth((state) => state.user);
  const login = useAuth((state) => state.login);
  const register = useAuth((state) => state.register);
  const logout = useAuth((state) => state.logout);
  const acceptSession = useAuth((state) => state.acceptSession);
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const googleReady = Boolean(browserSupabase());

  useEffect(() => {
    const client = browserSupabase();
    if (!client || useAuth.getState().token) return;
    client.auth.getSession().then(async ({ data }) => {
      const accessToken = data.session?.access_token;
      if (!accessToken) return;
      const result = await api.session(accessToken);
      acceptSession(result.token, result.user);
    }).catch(() => undefined);
  }, [acceptSession]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      const dest = (location.state as { from?: string } | null)?.from || '/account';
      navigate(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setPending(false);
    }
  }

  async function google() {
    const client = browserSupabase();
    if (!client) return;
    await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/account` } });
  }

  if (user) {
    return (
      <section className="page account">
        <p className="eyebrow">Account</p>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <p className="fine">{user.role === 'admin' ? 'Kitchen admin' : 'Guest'}</p>
        <div className="hero-actions">
          {user.role === 'admin' && <Link className="btn btn-primary" to="/admin">Open dashboard</Link>}
          <Link className="btn btn-ghost" to="/menu">Order again</Link>
          <button type="button" className="btn btn-ghost" onClick={logout}>Sign out</button>
        </div>
      </section>
    );
  }

  return (
    <section className="page account">
      <p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create an account'}</p>
      <h1>{mode === 'login' ? 'Sign in' : 'Join STOP&GO'}</h1>
      <form className="form-grid" onSubmit={submit}>
        {mode === 'register' && <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>}
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        {mode === 'register' && <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>}
        <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} /></label>
        {error && <p className="form-error span-2">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <button type="button" className="btn btn-ghost" disabled={!googleReady} onClick={google}>Continue with Google</button>
      {!googleReady && <p className="fine">Google sign-in switches on when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.</p>}
      <button type="button" className="text-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Need an account? Create one' : 'Already registered? Sign in'}
      </button>
      <aside className="demo-card">
        <h2>Team access</h2>
        <p>Admin · admin@stopandgo.com · StopGo2026!</p>
        <p>Guest · guest@stopandgo.com · Guest2026!</p>
      </aside>
    </section>
  );
}
