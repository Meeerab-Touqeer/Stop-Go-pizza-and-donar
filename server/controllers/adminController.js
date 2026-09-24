import { getStore } from '../services/store.js';
import {
  categorySchema,
  ingredientSchema,
  parse,
  productSchema,
  statusSchema,
  userUpdateSchema,
} from '../validation/schemas.js';

export async function stats(_req, res) {
  res.json(await getStore().stats());
}

export async function listProducts(_req, res) {
  const store = getStore();
  const [products, categories, ingredients] = await Promise.all([
    store.listProducts({ includeUnavailable: true }),
    store.listCategories(),
    store.listIngredients(),
  ]);
  res.json({ products, categories, ingredients });
}

export async function createProduct(req, res) {
  const body = parse(productSchema, req.body);
  const product = await getStore().createProduct(body);
  res.status(201).json({ product });
}

export async function updateProduct(req, res) {
  const body = parse(productSchema, req.body);
  const product = await getStore().updateProduct(req.params.id, body);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json({ product });
}

export async function deleteProduct(req, res) {
  await getStore().deleteProduct(req.params.id);
  res.json({ ok: true });
}

export async function createCategory(req, res) {
  const body = parse(categorySchema, req.body);
  res.status(201).json({ category: await getStore().createCategory(body) });
}

export async function updateCategory(req, res) {
  const body = parse(categorySchema, req.body);
  const category = await getStore().updateCategory(req.params.id, body);
  if (!category) return res.status(404).json({ error: 'Category not found.' });
  res.json({ category });
}

export async function deleteCategory(req, res) {
  await getStore().deleteCategory(req.params.id);
  res.json({ ok: true });
}

export async function createIngredient(req, res) {
  const body = parse(ingredientSchema, req.body);
  res.status(201).json({ ingredient: await getStore().createIngredient(body) });
}

export async function updateIngredient(req, res) {
  const body = parse(ingredientSchema, req.body);
  const ingredient = await getStore().updateIngredient(req.params.id, body);
  if (!ingredient) return res.status(404).json({ error: 'Ingredient not found.' });
  res.json({ ingredient });
}

export async function deleteIngredient(req, res) {
  await getStore().deleteIngredient(req.params.id);
  res.json({ ok: true });
}

export async function listOrders(_req, res) {
  res.json({ orders: await getStore().listOrders() });
}

export async function updateOrder(req, res) {
  const body = parse(statusSchema, req.body);
  const order = await getStore().updateOrderStatus(req.params.id, body.status);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json({ order });
}

export async function listCustomers(_req, res) {
  res.json({ customers: await getStore().listUsers() });
}

export async function updateCustomer(req, res) {
  const body = parse(userUpdateSchema, req.body);
  const user = await getStore().updateUser(req.params.id, body);
  if (!user) return res.status(404).json({ error: 'Customer not found.' });
  res.json({ user });
}

export async function listReviews(_req, res) {
  res.json({ reviews: await getStore().listReviews() });
}

export async function deleteReview(req, res) {
  await getStore().deleteReview(req.params.id);
  res.json({ ok: true });
}

export async function listMessages(_req, res) {
  res.json({ messages: await getStore().listMessages() });
}
