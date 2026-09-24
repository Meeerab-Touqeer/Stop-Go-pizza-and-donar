import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { sampleOrders, seed } from '../data/seed.js';

const dbFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/db.json');

let db;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function save() {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

export async function initLocalStore() {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  let fresh = !fs.existsSync(dbFile);
  if (!fresh) {
    db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    fresh = db.version !== seed.version;
  }
  if (fresh) {
    db = clone(seed);
    for (const user of db.users) {
      user.passwordHash = await bcrypt.hash(user.password, 10);
      delete user.password;
    }
    db.orders = sampleOrders();
    save();
  }
}

function categoryName(id) {
  return db.categories.find((category) => category.id === id)?.name || '';
}

function hydrateProduct(product) {
  const ingredients = db.ingredients.filter((ingredient) => product.ingredientIds?.includes(ingredient.id));
  return {
    ...product,
    category: categoryName(product.categoryId),
    ingredients,
  };
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, password, ...safe } = user;
  return safe;
}

function hydrateOrder(order) {
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      options: item.options || [],
    })),
  };
}

export const localStore = {
  mode: 'local',
  async listCategories() {
    return clone(db.categories);
  },
  async listProducts({ includeUnavailable = false } = {}) {
    return db.products
      .filter((product) => includeUnavailable || product.isAvailable)
      .map((product) => hydrateProduct(clone(product)));
  },
  async getProduct(id) {
    const product = db.products.find((item) => item.id === id);
    return product ? hydrateProduct(clone(product)) : null;
  },
  async createProduct(input) {
    const product = {
      id: crypto.randomUUID(),
      rating: 4.8,
      preparationTime: 15,
      calories: 0,
      isAvailable: true,
      isVegetarian: false,
      isSpicy: false,
      discountPercent: 0,
      compareAt: null,
      customizer: 'simple',
      allergens: [],
      ingredientIds: [],
      defaults: {},
      featured: false,
      builder: false,
      createdAt: new Date().toISOString(),
      ...input,
    };
    db.products.unshift(product);
    save();
    return hydrateProduct(clone(product));
  },
  async updateProduct(id, input) {
    const index = db.products.findIndex((item) => item.id === id);
    if (index < 0) return null;
    db.products[index] = { ...db.products[index], ...input, id };
    save();
    return hydrateProduct(clone(db.products[index]));
  },
  async deleteProduct(id) {
    db.products = db.products.filter((item) => item.id !== id);
    save();
  },
  async listIngredients() {
    return clone(db.ingredients);
  },
  async createIngredient(input) {
    const ingredient = { id: crypto.randomUUID(), image: '', createdAt: new Date().toISOString(), ...input };
    db.ingredients.push(ingredient);
    save();
    return clone(ingredient);
  },
  async updateIngredient(id, input) {
    const index = db.ingredients.findIndex((item) => item.id === id);
    if (index < 0) return null;
    db.ingredients[index] = { ...db.ingredients[index], ...input, id };
    save();
    return clone(db.ingredients[index]);
  },
  async deleteIngredient(id) {
    db.ingredients = db.ingredients.filter((item) => item.id !== id);
    db.products.forEach((product) => {
      product.ingredientIds = (product.ingredientIds || []).filter((ingredientId) => ingredientId !== id);
    });
    save();
  },
  async createCategory(input) {
    const category = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), image: '', ...input };
    db.categories.push(category);
    save();
    return clone(category);
  },
  async updateCategory(id, input) {
    const index = db.categories.findIndex((item) => item.id === id);
    if (index < 0) return null;
    db.categories[index] = { ...db.categories[index], ...input, id };
    save();
    return clone(db.categories[index]);
  },
  async deleteCategory(id) {
    if (db.products.some((product) => product.categoryId === id)) {
      const error = new Error('Move products out of this category before deleting it.');
      error.status = 400;
      throw error;
    }
    db.categories = db.categories.filter((item) => item.id !== id);
    save();
  },
  async listUsers() {
    return db.users.map((user) => publicUser(user));
  },
  async findUserByEmail(email) {
    return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
  },
  async createUser(input) {
    const user = { id: crypto.randomUUID(), phone: '', createdAt: new Date().toISOString(), ...input };
    db.users.push(user);
    save();
    return publicUser(user);
  },
  async updateUser(id, input) {
    const index = db.users.findIndex((item) => item.id === id);
    if (index < 0) return null;
    db.users[index] = { ...db.users[index], ...input, id };
    save();
    return publicUser(db.users[index]);
  },
  async listOrders() {
    return db.orders.map((order) => hydrateOrder(clone(order))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getOrder(id) {
    const order = db.orders.find((item) => item.id === id);
    return order ? hydrateOrder(clone(order)) : null;
  },
  async createOrder(order) {
    db.orders.unshift(order);
    save();
    return hydrateOrder(clone(order));
  },
  async updateOrderStatus(id, status) {
    const order = db.orders.find((item) => item.id === id);
    if (!order) return null;
    order.status = status;
    save();
    return hydrateOrder(clone(order));
  },
  async listReviews() {
    return clone(db.reviews).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async createReview(input) {
    const review = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...input };
    db.reviews.unshift(review);
    save();
    return clone(review);
  },
  async deleteReview(id) {
    db.reviews = db.reviews.filter((item) => item.id !== id);
    save();
  },
  async createMessage(input) {
    const message = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...input };
    db.messages.unshift(message);
    save();
    return clone(message);
  },
  async listMessages() {
    return clone(db.messages);
  },
  async stats() {
    return buildStats(db);
  },
};

export function buildStats(source) {
  const orders = source.orders || [];
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((order) => new Date(order.createdAt) >= startOfToday && order.status !== 'cancelled');
  const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);

  const productName = new Map((source.products || []).map((product) => [product.id, product.name]));
  const categoryByProduct = new Map((source.products || []).map((product) => [product.id, product.categoryId]));
  const categoryNameById = new Map((source.categories || []).map((category) => [category.id, category.name]));

  const sold = new Map();
  const byCategory = new Map();
  orders.forEach((order) => {
    if (order.status === 'cancelled') return;
    (order.items || []).forEach((item) => {
      const current = sold.get(item.productId) || { name: item.productName || productName.get(item.productId) || 'Item', qty: 0, revenue: 0 };
      current.qty += item.quantity;
      current.revenue += Number(item.totalPrice);
      sold.set(item.productId, current);
      const categoryId = categoryByProduct.get(item.productId);
      const label = categoryNameById.get(categoryId) || 'Other';
      byCategory.set(label, (byCategory.get(label) || 0) + item.quantity);
    });
  });

  const bestSellers = [...sold.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  const dailySales = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const slice = orders.filter((order) => {
      const created = new Date(order.createdAt);
      return created >= day && created < next && order.status !== 'cancelled';
    });
    return {
      date: day.toLocaleDateString('en-US', { weekday: 'short' }),
      total: Math.round(slice.reduce((sum, order) => sum + Number(order.total), 0) * 100) / 100,
      orders: slice.length,
    };
  });

  const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
    const month = new Date();
    month.setDate(1);
    month.setHours(0, 0, 0, 0);
    month.setMonth(month.getMonth() - (5 - index));
    const next = new Date(month);
    next.setMonth(month.getMonth() + 1);
    const slice = orders.filter((order) => {
      const created = new Date(order.createdAt);
      return created >= month && created < next && order.status !== 'cancelled';
    });
    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      total: Math.round(slice.reduce((sum, order) => sum + Number(order.total), 0) * 100) / 100,
    };
  });

  return {
    todayOrders: todayOrders.length,
    todayRevenue: Math.round(todayRevenue * 100) / 100,
    totalCustomers: (source.users || []).filter((user) => user.role !== 'admin').length,
    bestSellers,
    dailySales,
    monthlyRevenue,
    ordersByCategory: [...byCategory.entries()].map(([name, count]) => ({ name, count })),
    popularProducts: bestSellers.map((item) => ({ name: item.name, qty: item.qty })),
  };
}
