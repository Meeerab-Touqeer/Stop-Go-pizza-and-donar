import { Router } from 'express';
import { authLimit, login, me, meMiddleware, register, session } from '../controllers/authController.js';
import { catalog, contact, createReview, product, reviewAuth } from '../controllers/catalogController.js';
import { createOrder, getOrder } from '../controllers/orderController.js';
import {
  createCategory,
  createIngredient,
  createProduct,
  deleteCategory,
  deleteIngredient,
  deleteProduct,
  deleteReview,
  listCustomers,
  listMessages,
  listOrders,
  listProducts,
  listReviews,
  stats,
  updateCategory,
  updateCustomer,
  updateIngredient,
  updateOrder,
  updateProduct,
} from '../controllers/adminController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

export const api = Router();

api.get('/health', (_req, res) => res.json({ ok: true, brand: 'STOP&GO' }));
api.get('/catalog', catalog);
api.get('/products/:id', product);
api.post('/contact', contact);
api.post('/auth/register', authLimit, register);
api.post('/auth/login', authLimit, login);
api.post('/auth/session', session);
api.get('/auth/me', meMiddleware, me);
api.post('/reviews', reviewAuth, createReview);
api.post('/orders', optionalUser, createOrder);
api.get('/orders/:id', optionalUser, getOrder);

const admin = Router();
admin.use(requireAuth, requireAdmin);
admin.get('/stats', stats);
admin.get('/products', listProducts);
admin.post('/products', createProduct);
admin.put('/products/:id', updateProduct);
admin.delete('/products/:id', deleteProduct);
admin.post('/categories', createCategory);
admin.put('/categories/:id', updateCategory);
admin.delete('/categories/:id', deleteCategory);
admin.post('/ingredients', createIngredient);
admin.put('/ingredients/:id', updateIngredient);
admin.delete('/ingredients/:id', deleteIngredient);
admin.get('/orders', listOrders);
admin.patch('/orders/:id', updateOrder);
admin.get('/customers', listCustomers);
admin.patch('/customers/:id', updateCustomer);
admin.get('/reviews', listReviews);
admin.delete('/reviews/:id', deleteReview);
admin.get('/messages', listMessages);
api.use('/admin', admin);

async function optionalUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next();
  requireAuth(req, res, next);
}
