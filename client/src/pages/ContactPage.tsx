import { FormEvent, useState } from 'react';
import { api } from '../services/api';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setStatus('');
    try {
      await api.contact(form);
      setStatus('Message received. The kitchen will reply by email.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that.');
    }
  }

  return (
    <section className="page contact">
      <div>
        <p className="eyebrow">Contact</p>
        <h1>Talk to the pass.</h1>
        <p>120 Market Street, Your City<br />Open daily, 11:00 – 23:00<br />(555) 014-2026<br />hello@stopandgo.restaurant</p>
        <img src="/food/09-pita.jpg" alt="A pita doner on the pass" />
      </div>
      <form onSubmit={submit} className="form-grid">
        <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        <label className="span-2">Message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required minLength={8} /></label>
        {error && <p className="form-error span-2">{error}</p>}
        {status && <p className="fine span-2">{status}</p>}
        <button className="btn btn-primary" type="submit">Send</button>
      </form>
    </section>
  );
}
