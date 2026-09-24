import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { money } from '../data/options';
import { orderNumber } from '../lib/pricing';
import type { Order } from '../types';

const stages = [
  ['received', 'Order Received'],
  ['preparing', 'Preparing'],
  ['cooking', 'Cooking'],
  ['out_for_delivery', 'Out for Delivery'],
  ['delivered', 'Delivered'],
];

export function TrackPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [eta, setEta] = useState<string>(location.state?.eta || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.order(id).then((data) => {
      setOrder(data.order);
      setEta(data.eta);
    }).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <section className="page empty-state"><h1>Order not found.</h1><p>{error}</p></section>;
  if (!order) return <section className="page"><p className="eyebrow">Tracking</p><h1>Finding your order...</h1></section>;

  const current = Math.max(0, stages.findIndex(([key]) => key === order.status));
  const cancelled = order.status === 'cancelled';

  return (
    <section className="page track">
      <p className="eyebrow">STOP&amp;GO</p>
      <h1>Order confirmed!</h1>
      <p className="hero-support">Your STOP&amp;GO order is being prepared.</p>
      <div className="confirm-grid">
        <article>
          <span>Order number</span>
          <strong>{orderNumber(order.id)}</strong>
        </article>
        <article>
          <span>Estimated delivery</span>
          <strong>{eta ? new Date(eta).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '35 min'}</strong>
        </article>
        <article>
          <span>Total</span>
          <strong>{money(order.total)}</strong>
        </article>
      </div>
      <h2>Track order</h2>
      {cancelled ? <p>This order was cancelled.</p> : (
        <ol className="timeline">
          {stages.map(([key, label], index) => (
            <li key={key} className={index < current ? 'done' : index === current ? 'current' : ''}>
              <i />
              <span>{label}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="track-columns">
        <div>
          <h3>Order summary</h3>
          <ul className="review-list">
            {order.items.map((item) => (
              <li key={item.id}>
                <span>{item.quantity} × {item.productName}</span>
                <small>{item.options.map((option) => option.name).join(' · ')}</small>
                <b>{money(item.totalPrice)}</b>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Delivery address</h3>
          <p>{order.deliveryAddress}</p>
          {order.deliveryInstructions && <p className="fine">{order.deliveryInstructions}</p>}
          <p className="fine">Payment: {order.paymentMethod === 'cod' ? 'Cash on delivery' : order.paymentMethod}</p>
          <Link className="btn btn-ghost" to="/menu">Order something else</Link>
        </div>
      </div>
    </section>
  );
}
