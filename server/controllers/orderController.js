import { DELIVERY_FEE, TAX_RATE, roundMoney } from '../data/options.js';
import { getStore } from '../services/store.js';
import { quoteProduct } from '../services/pricing.js';
import { orderSchema, parse } from '../validation/schemas.js';

async function stripeIntent(total, email) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { configured: false };
  }
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
    });
    return { configured: true, clientSecret: intent.client_secret };
  } catch (error) {
    return { configured: false, message: error.message };
  }
}

export async function createOrder(req, res) {
  const body = parse(orderSchema, req.body);
  const store = getStore();
  const ingredients = await store.listIngredients();
  const items = [];

  for (const entry of body.items) {
    const product = await store.getProduct(entry.productId);
    if (!product || !product.isAvailable) {
      return res.status(400).json({ error: 'One item in your cart is no longer available.' });
    }
    const quote = quoteProduct(product, entry.selection || {}, ingredients);
    items.push({
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      image: product.image,
      quantity: entry.quantity,
      basePrice: quote.basePrice,
      customizationPrice: quote.customizationPrice,
      totalPrice: roundMoney(quote.unitPrice * entry.quantity),
      options: quote.options,
    });
  }

  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.totalPrice, 0));
  const code = (body.discountCode || '').toUpperCase();
  const discount = code === 'STOP10' ? roundMoney(subtotal * 0.1) : 0;
  if (body.discountCode && code !== 'STOP10') {
    return res.status(400).json({ error: 'That discount code is not active.' });
  }
  const deliveryFee = DELIVERY_FEE;
  const tax = roundMoney((subtotal - discount) * TAX_RATE);
  const total = roundMoney(subtotal - discount + deliveryFee + tax);
  const address = `${body.delivery.address}, ${body.delivery.city}, ${body.delivery.postalCode}`;

  let payment = { configured: true };
  if (body.paymentMethod === 'stripe') payment = await stripeIntent(total, body.customer.email);

  const order = await store.createOrder({
    id: crypto.randomUUID(),
    userId: req.user?.id || null,
    customerName: body.customer.name,
    customerEmail: body.customer.email,
    customerPhone: body.customer.phone,
    subtotal,
    deliveryFee,
    discount,
    discountCode: code === 'STOP10' ? code : '',
    tax,
    total,
    status: 'preparing',
    paymentMethod: body.paymentMethod,
    deliveryAddress: address,
    deliveryInstructions: body.delivery.instructions || '',
    createdAt: new Date().toISOString(),
    items,
  });

  const eta = new Date(Date.now() + 35 * 60 * 1000).toISOString();
  res.status(201).json({ order, eta, payment });
}

export async function getOrder(req, res) {
  const order = await getStore().getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (req.user && req.user.role !== 'admin' && order.userId && order.userId !== req.user.id) {
    return res.status(403).json({ error: 'That order belongs to another account.' });
  }
  const eta = new Date(new Date(order.createdAt).getTime() + 35 * 60 * 1000).toISOString();
  res.json({ order, eta });
}
