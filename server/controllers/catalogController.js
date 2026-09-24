import { getStore } from '../services/store.js';
import { requireAuth } from '../middleware/auth.js';
import { contactSchema, parse, reviewSchema } from '../validation/schemas.js';

export async function catalog(_req, res) {
  const store = getStore();
  const [categories, products, ingredients, reviews] = await Promise.all([
    store.listCategories(),
    store.listProducts(),
    store.listIngredients(),
    store.listReviews(),
  ]);
  res.json({ categories, products, ingredients, reviews });
}

export async function product(req, res) {
  const found = await getStore().getProduct(req.params.id);
  if (!found || !found.isAvailable) return res.status(404).json({ error: 'That item is not on the menu.' });
  const reviews = (await getStore().listReviews()).filter((review) => review.productId === found.id);
  res.json({ product: found, reviews });
}

export async function createReview(req, res) {
  const body = parse(reviewSchema, req.body);
  const product = await getStore().getProduct(body.productId);
  if (!product) return res.status(404).json({ error: 'That item is not on the menu.' });
  const review = await getStore().createReview({
    userId: req.user.id,
    productId: body.productId,
    authorName: req.user.name,
    rating: body.rating,
    comment: body.comment,
  });
  res.status(201).json({ review });
}

export async function contact(req, res) {
  const body = parse(contactSchema, req.body);
  await getStore().createMessage(body);
  res.status(201).json({ ok: true });
}

export const reviewAuth = requireAuth;
