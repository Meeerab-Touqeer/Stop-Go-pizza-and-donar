import { Link } from 'react-router-dom';
import { FoodVisual } from '../components/FoodVisual';
import { DELIVERY_FEE, TAX_RATE, money } from '../data/options';
import { cartSubtotal, useCart } from '../store/useCart';
import { useUi } from '../store/useUi';

export function CartPage() {
  const lines = useCart((state) => state.lines);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const clear = useCart((state) => state.clear);
  const openProduct = useUi((state) => state.openProduct);
  const subtotal = cartSubtotal(lines);
  const discount = 0;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal - discount + (lines.length ? DELIVERY_FEE : 0) + tax) * 100) / 100;

  if (!lines.length) {
    return (
      <section className="page empty-state">
        <p className="eyebrow">Your order</p>
        <h1>The bag is empty.</h1>
        <p>Pizza, doner, or a deal. The cart keeps every customization.</p>
        <Link className="btn btn-primary" to="/menu">Explore Menu</Link>
      </section>
    );
  }

  return (
    <section className="page cart-page">
      <div>
        <div className="section-head">
          <p className="eyebrow">Review</p>
          <h1>Your order</h1>
        </div>
        <ul className="cart-list">
          {lines.map((line) => (
            <li key={line.lineId}>
              <FoodVisual image={line.image} name={line.name} />
              <div>
                <h2>{line.name}</h2>
                <p>{line.options.filter((option) => option.type !== 'removed').map((option) => option.name).join(' · ')}</p>
                {line.options.some((option) => option.type === 'extra' || option.type === 'removed') && (
                  <p className="fine">{line.options.filter((option) => option.type === 'extra' || option.type === 'removed').map((option) => option.name).join(', ')}</p>
                )}
                <p className="fine">Base {money(line.basePrice)} · Customization {money(line.customizationPrice)}</p>
                <div className="cart-line-actions">
                  <div className="qty">
                    <button type="button" onClick={() => setQty(line.lineId, line.quantity - 1)} aria-label="Decrease">−</button>
                    <span>{line.quantity}</span>
                    <button type="button" onClick={() => setQty(line.lineId, Math.min(20, line.quantity + 1))} aria-label="Increase">+</button>
                  </div>
                  <button type="button" onClick={() => openProduct(line.productId, line.lineId)}>Edit</button>
                  <button type="button" onClick={() => remove(line.lineId)}>Remove</button>
                </div>
              </div>
              <strong>{money(line.unitPrice * line.quantity)}</strong>
            </li>
          ))}
        </ul>
        <button type="button" className="text-btn" onClick={clear}>Clear cart</button>
      </div>
      <aside className="summary">
        <h2>Order summary</h2>
        <Row label="Subtotal" value={money(subtotal)} />
        <Row label="Delivery fee" value={money(DELIVERY_FEE)} />
        <Row label="Discount" value={money(discount)} />
        <Row label="Tax" value={money(tax)} />
        <Row label="Grand total" value={money(total)} strong />
        <p className="fine">Use STOP10 at checkout for 10% off.</p>
        <Link className="btn btn-primary" to="/checkout">Proceed to Checkout</Link>
      </aside>
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <p className={strong ? 'summary-strong' : ''}><span>{label}</span><span>{value}</span></p>;
}
