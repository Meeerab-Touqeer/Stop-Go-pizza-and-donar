import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../store/useAuth';
import { cartSubtotal, useCart } from '../store/useCart';
import { money } from '../data/options';

const steps = ['Details', 'Delivery', 'Review', 'Payment'];

export function CheckoutPage() {
  const lines = useCart((state) => state.lines);
  const clear = useCart((state) => state.clear);
  const user = useAuth((state) => state.user);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    instructions: '',
    discountCode: '',
    paymentMethod: 'cod',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  if (!lines.length) {
    return <section className="page empty-state"><h1>Nothing to check out.</h1><Link className="btn btn-primary" to="/menu">Back to menu</Link></section>;
  }

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function next() {
    setError('');
    if (step === 0 && (form.name.trim().length < 2 || !form.email.includes('@') || form.phone.trim().length < 7)) {
      setError('Add your name, a valid email, and a phone number.');
      return;
    }
    if (step === 1 && (form.address.trim().length < 5 || form.city.trim().length < 2 || form.postalCode.trim().length < 3)) {
      setError('Add an address, city, and postal code.');
      return;
    }
    if (step === 3 && form.paymentMethod === 'card' && (form.cardNumber.replace(/\s/g, '').length < 12 || form.expiry.length < 4 || form.cvc.length < 3)) {
      setError('Enter card number, expiry, and CVC, or choose cash on delivery.');
      return;
    }
    if (step < 3) setStep(step + 1);
    else void place();
  }

  async function place() {
    setPending(true);
    setError('');
    try {
      const result = await api.createOrder({
        customer: { name: form.name, email: form.email, phone: form.phone },
        delivery: { address: form.address, city: form.city, postalCode: form.postalCode, instructions: form.instructions },
        paymentMethod: form.paymentMethod,
        discountCode: form.discountCode,
        items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, selection: line.selection })),
      });
      clear();
      navigate(`/order/${result.order.id}`, { state: { eta: result.eta, payment: result.payment } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place the order.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="page checkout">
      <div>
        <p className="eyebrow">Checkout</p>
        <h1>Almost at the pass.</h1>
        <ol className="steps">
          {steps.map((label, index) => <li key={label} className={index === step ? 'on' : index < step ? 'done' : ''}>{label}</li>)}
        </ol>
        {step === 0 && (
          <div className="form-grid">
            <Field label="Name" value={form.name} onChange={(value) => update('name', value)} />
            <Field label="Email" value={form.email} onChange={(value) => update('email', value)} type="email" />
            <Field label="Phone" value={form.phone} onChange={(value) => update('phone', value)} />
          </div>
        )}
        {step === 1 && (
          <div className="form-grid">
            <Field label="Address" value={form.address} onChange={(value) => update('address', value)} />
            <Field label="City" value={form.city} onChange={(value) => update('city', value)} />
            <Field label="Postal code" value={form.postalCode} onChange={(value) => update('postalCode', value)} />
            <label className="span-2">Delivery instructions
              <textarea value={form.instructions} onChange={(event) => update('instructions', event.target.value)} />
            </label>
          </div>
        )}
        {step === 2 && (
          <ul className="review-list">
            {lines.map((line) => (
              <li key={line.lineId}>
                <span>{line.quantity} × {line.name}</span>
                <small>{line.options.map((option) => option.name).join(' · ')}</small>
                <b>{money(line.unitPrice * line.quantity)}</b>
              </li>
            ))}
            <label>Discount code
              <input value={form.discountCode} onChange={(event) => update('discountCode', event.target.value)} placeholder="STOP10" />
            </label>
          </ul>
        )}
        {step === 3 && (
          <div className="pay-options">
            {[
              ['cod', 'Cash on delivery'],
              ['card', 'Card'],
              ['stripe', 'Stripe'],
            ].map(([id, label]) => (
              <label key={id} className={form.paymentMethod === id ? 'pay on' : 'pay'}>
                <input type="radio" name="pay" checked={form.paymentMethod === id} onChange={() => update('paymentMethod', id)} />
                {label}
              </label>
            ))}
            {form.paymentMethod === 'card' && (
              <div className="form-grid">
                <Field label="Card number" value={form.cardNumber} onChange={(value) => update('cardNumber', value)} />
                <Field label="Expiry" value={form.expiry} onChange={(value) => update('expiry', value)} />
                <Field label="CVC" value={form.cvc} onChange={(value) => update('cvc', value)} />
              </div>
            )}
            {form.paymentMethod === 'stripe' && <p className="fine">Stripe charges when STRIPE_SECRET_KEY is set on the server. Until then, the order is saved and the kitchen still receives it.</p>}
            {form.paymentMethod === 'card' && <p className="fine">Card details are checked for shape only. Connect Stripe to capture a real payment.</p>}
          </div>
        )}
        {error && <p className="form-error">{error}</p>}
        <div className="hero-actions">
          {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
          <button type="button" className="btn btn-primary" disabled={pending} onClick={next}>{step === 3 ? (pending ? 'Placing...' : 'Place order') : 'Continue'}</button>
        </div>
      </div>
      <aside className="summary">
        <h2>This order</h2>
        <p><span>Items</span><span>{money(cartSubtotal(lines))}</span></p>
        <p className="fine">{lines.length} custom plates. The server confirms tax, delivery, and any STOP10 discount.</p>
      </aside>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label>{label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
