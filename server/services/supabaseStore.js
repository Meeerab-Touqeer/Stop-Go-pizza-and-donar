import { createClient } from '@supabase/supabase-js';
import { sampleOrders, seed } from '../data/seed.js';
import { buildStats } from './localStore.js';

let sb;

function fail(error) {
  if (!error) return;
  const wrapped = new Error(error.message || 'Database error');
  wrapped.status = 500;
  throw wrapped;
}

function mapIngredient(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    image: row.image || '',
    createdAt: row.created_at,
  };
}

function mapProduct(row) {
  const ingredients = (row.product_ingredients || [])
    .map((link) => mapIngredient(link.ingredients))
    .filter(Boolean);
  return {
    id: row.id,
    categoryId: row.category_id,
    category: row.categories?.name || '',
    name: row.name,
    description: row.description,
    basePrice: Number(row.base_price),
    compareAt: row.compare_at == null ? null : Number(row.compare_at),
    image: row.image || '',
    rating: Number(row.rating),
    preparationTime: row.preparation_time,
    calories: row.calories,
    isAvailable: row.is_available,
    isVegetarian: row.is_vegetarian,
    isSpicy: row.is_spicy,
    discountPercent: row.discount_percent || 0,
    customizer: row.customizer,
    allergens: row.allergens || [],
    ingredientIds: ingredients.map((item) => item.id),
    defaults: row.defaults || {},
    featured: Boolean(row.featured),
    builder: Boolean(row.builder),
    createdAt: row.created_at,
    ingredients,
  };
}

function productToRow(input) {
  return {
    category_id: input.categoryId,
    name: input.name,
    description: input.description,
    base_price: input.basePrice,
    compare_at: input.compareAt ?? null,
    image: input.image || '',
    rating: input.rating ?? 4.8,
    preparation_time: input.preparationTime,
    calories: input.calories,
    is_available: input.isAvailable,
    is_vegetarian: input.isVegetarian,
    is_spicy: input.isSpicy,
    discount_percent: input.discountPercent ?? 0,
    customizer: input.customizer,
    allergens: input.allergens || [],
    defaults: input.defaults || {},
    featured: Boolean(input.featured),
    builder: Boolean(input.builder),
  };
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    role: row.role,
    createdAt: row.created_at,
  };
}

async function setLinks(productId, ingredientIds = []) {
  const deleted = await sb.from('product_ingredients').delete().eq('product_id', productId);
  fail(deleted.error);
  if (!ingredientIds.length) return;
  const inserted = await sb.from('product_ingredients').insert(
    ingredientIds.map((ingredientId) => ({ product_id: productId, ingredient_id: ingredientId })),
  );
  fail(inserted.error);
}

async function loadOrders() {
  const ordersQuery = await sb.from('orders').select('*').order('created_at', { ascending: false });
  fail(ordersQuery.error);
  const orders = ordersQuery.data || [];
  if (!orders.length) return [];
  const itemsQuery = await sb.from('order_items').select('*').in('order_id', orders.map((order) => order.id));
  fail(itemsQuery.error);
  const items = itemsQuery.data || [];
  let options = [];
  if (items.length) {
    const optionsQuery = await sb.from('order_item_options').select('*').in('order_item_id', items.map((item) => item.id));
    fail(optionsQuery.error);
    options = optionsQuery.data || [];
  }
  return orders.map((order) => ({
    id: order.id,
    userId: order.user_id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.delivery_fee),
    discount: Number(order.discount),
    discountCode: order.discount_code || '',
    tax: Number(order.tax),
    total: Number(order.total),
    status: order.status,
    paymentMethod: order.payment_method,
    deliveryAddress: order.delivery_address,
    deliveryInstructions: order.delivery_instructions || '',
    createdAt: order.created_at,
    items: items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        image: item.image || '',
        quantity: item.quantity,
        basePrice: Number(item.base_price),
        customizationPrice: Number(item.customization_price),
        totalPrice: Number(item.total_price),
        options: options
          .filter((option) => option.order_item_id === item.id)
          .map((option) => ({
            type: option.option_type,
            name: option.option_name,
            price: Number(option.price),
          })),
      })),
  }));
}

async function bootstrap() {
  const existing = await sb.from('categories').select('*', { count: 'exact', head: true });
  fail(existing.error);
  if ((existing.count || 0) > 0) return;

  const userIds = new Map();
  for (const user of seed.users) {
    const created = await sb.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { name: user.name },
    });
    const id = created.data?.user?.id;
    if (id) {
      userIds.set(user.email, id);
      const upserted = await sb.from('users').upsert({
        id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
      fail(upserted.error);
    }
  }

  const categories = await sb.from('categories').insert(seed.categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
  })));
  fail(categories.error);

  const ingredients = await sb.from('ingredients').insert(seed.ingredients.map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    price: ingredient.price,
    category: ingredient.category,
    image: ingredient.image,
  })));
  fail(ingredients.error);

  const products = await sb.from('products').insert(seed.products.map((product) => ({
    id: product.id,
    ...productToRow(product),
  })));
  fail(products.error);

  const links = seed.products.flatMap((product) =>
    (product.ingredientIds || []).map((ingredientId) => ({ product_id: product.id, ingredient_id: ingredientId })),
  );
  if (links.length) fail((await sb.from('product_ingredients').insert(links)).error);

  const guestId = userIds.get('guest@stopandgo.com') || null;
  const reviews = await sb.from('reviews').insert(seed.reviews.map((review) => ({
    id: review.id,
    user_id: guestId,
    product_id: review.productId,
    author_name: review.authorName,
    rating: review.rating,
    comment: review.comment,
  })));
  fail(reviews.error);

  for (const order of sampleOrders()) {
    const inserted = await sb.from('orders').insert({
      user_id: guestId,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      discount: order.discount,
      discount_code: order.discountCode,
      tax: order.tax,
      total: order.total,
      status: order.status,
      payment_method: order.paymentMethod,
      delivery_address: order.deliveryAddress,
      delivery_instructions: order.deliveryInstructions,
      created_at: order.createdAt,
    }).select('id').single();
    fail(inserted.error);
    for (const item of order.items) {
      const itemInsert = await sb.from('order_items').insert({
        order_id: inserted.data.id,
        product_id: item.productId,
        product_name: item.productName,
        image: item.image,
        quantity: item.quantity,
        base_price: item.basePrice,
        customization_price: item.customizationPrice,
        total_price: item.totalPrice,
      }).select('id').single();
      fail(itemInsert.error);
      if (item.options?.length) {
        fail((await sb.from('order_item_options').insert(item.options.map((option) => ({
          order_item_id: itemInsert.data.id,
          option_type: option.type,
          option_name: option.name,
          price: option.price,
        })))).error);
      }
    }
  }
}

export async function initSupabase() {
  sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await bootstrap();
}

const productSelect = '*, categories(name, slug), product_ingredients(ingredients(*))';

export const supabaseStore = {
  mode: 'supabase',
  async verifyAccessToken(accessToken) {
    const verified = await sb.auth.getUser(accessToken);
    fail(verified.error);
    const profile = await sb.from('users').select('*').eq('id', verified.data.user.id).maybeSingle();
    fail(profile.error);
    if (!profile.data) {
      const inserted = await sb.from('users').insert({
        id: verified.data.user.id,
        name: verified.data.user.user_metadata?.name || verified.data.user.email.split('@')[0],
        email: verified.data.user.email,
        role: 'customer',
      }).select('*').single();
      fail(inserted.error);
      return mapUser(inserted.data);
    }
    return mapUser(profile.data);
  },
  async listCategories() {
    const result = await sb.from('categories').select('*').order('name');
    fail(result.error);
    return result.data.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      createdAt: category.created_at,
    }));
  },
  async listProducts({ includeUnavailable = false } = {}) {
    let query = sb.from('products').select(productSelect).order('name');
    if (!includeUnavailable) query = query.eq('is_available', true);
    const result = await query;
    fail(result.error);
    return result.data.map(mapProduct);
  },
  async getProduct(id) {
    const result = await sb.from('products').select(productSelect).eq('id', id).maybeSingle();
    fail(result.error);
    return result.data ? mapProduct(result.data) : null;
  },
  async createProduct(input) {
    const result = await sb.from('products').insert(productToRow(input)).select('id').single();
    fail(result.error);
    await setLinks(result.data.id, input.ingredientIds || []);
    return this.getProduct(result.data.id);
  },
  async updateProduct(id, input) {
    const result = await sb.from('products').update(productToRow(input)).eq('id', id);
    fail(result.error);
    if (input.ingredientIds) await setLinks(id, input.ingredientIds);
    return this.getProduct(id);
  },
  async deleteProduct(id) {
    fail((await sb.from('products').delete().eq('id', id)).error);
  },
  async listIngredients() {
    const result = await sb.from('ingredients').select('*').order('name');
    fail(result.error);
    return result.data.map(mapIngredient);
  },
  async createIngredient(input) {
    const result = await sb.from('ingredients').insert({
      name: input.name,
      price: input.price,
      category: input.category,
      image: input.image || '',
    }).select('*').single();
    fail(result.error);
    return mapIngredient(result.data);
  },
  async updateIngredient(id, input) {
    const result = await sb.from('ingredients').update({
      name: input.name,
      price: input.price,
      category: input.category,
      image: input.image || '',
    }).eq('id', id).select('*').single();
    fail(result.error);
    return mapIngredient(result.data);
  },
  async deleteIngredient(id) {
    fail((await sb.from('ingredients').delete().eq('id', id)).error);
  },
  async createCategory(input) {
    const result = await sb.from('categories').insert({
      name: input.name,
      slug: input.slug,
      description: input.description || '',
      image: input.image || '',
    }).select('*').single();
    fail(result.error);
    return { id: result.data.id, name: result.data.name, slug: result.data.slug, description: result.data.description, image: result.data.image, createdAt: result.data.created_at };
  },
  async updateCategory(id, input) {
    const result = await sb.from('categories').update({
      name: input.name,
      slug: input.slug,
      description: input.description || '',
      image: input.image || '',
    }).eq('id', id).select('*').single();
    fail(result.error);
    return { id: result.data.id, name: result.data.name, slug: result.data.slug, description: result.data.description, image: result.data.image, createdAt: result.data.created_at };
  },
  async deleteCategory(id) {
    const result = await sb.from('categories').delete().eq('id', id);
    if (result.error) {
      const error = new Error('Move products out of this category before deleting it.');
      error.status = 400;
      throw error;
    }
  },
  async listUsers() {
    const result = await sb.from('users').select('*').order('created_at', { ascending: false });
    fail(result.error);
    return result.data.map(mapUser);
  },
  async findUserByEmail(email) {
    const result = await sb.from('users').select('*').ilike('email', email).maybeSingle();
    fail(result.error);
    return result.data ? { ...mapUser(result.data), passwordHash: null } : null;
  },
  async createUser(input) {
    const created = await sb.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { name: input.name },
    });
    if (created.error) {
      const error = new Error(created.error.message);
      error.status = 400;
      throw error;
    }
    const result = await sb.from('users').upsert({
      id: created.data.user.id,
      name: input.name,
      email: input.email,
      phone: input.phone || '',
      role: 'customer',
    }).select('*').single();
    fail(result.error);
    return mapUser(result.data);
  },
  async updateUser(id, input) {
    const result = await sb.from('users').update({
      name: input.name,
      phone: input.phone,
      role: input.role,
    }).eq('id', id).select('*').single();
    fail(result.error);
    return mapUser(result.data);
  },
  async listOrders() {
    return loadOrders();
  },
  async getOrder(id) {
    const orders = await loadOrders();
    return orders.find((order) => order.id === id) || null;
  },
  async createOrder(order) {
    const inserted = await sb.from('orders').insert({
      user_id: order.userId,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      discount: order.discount,
      discount_code: order.discountCode || '',
      tax: order.tax,
      total: order.total,
      status: order.status,
      payment_method: order.paymentMethod,
      delivery_address: order.deliveryAddress,
      delivery_instructions: order.deliveryInstructions || '',
    }).select('id').single();
    fail(inserted.error);
    for (const item of order.items) {
      const itemInsert = await sb.from('order_items').insert({
        order_id: inserted.data.id,
        product_id: item.productId,
        product_name: item.productName,
        image: item.image,
        quantity: item.quantity,
        base_price: item.basePrice,
        customization_price: item.customizationPrice,
        total_price: item.totalPrice,
      }).select('id').single();
      fail(itemInsert.error);
      if (item.options?.length) {
        fail((await sb.from('order_item_options').insert(item.options.map((option) => ({
          order_item_id: itemInsert.data.id,
          option_type: option.type,
          option_name: option.name,
          price: option.price,
        })))).error);
      }
    }
    return this.getOrder(inserted.data.id);
  },
  async updateOrderStatus(id, status) {
    fail((await sb.from('orders').update({ status }).eq('id', id)).error);
    return this.getOrder(id);
  },
  async listReviews() {
    const result = await sb.from('reviews').select('*').order('created_at', { ascending: false });
    fail(result.error);
    return result.data.map((review) => ({
      id: review.id,
      userId: review.user_id,
      productId: review.product_id,
      authorName: review.author_name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
    }));
  },
  async createReview(input) {
    const result = await sb.from('reviews').insert({
      user_id: input.userId,
      product_id: input.productId,
      author_name: input.authorName,
      rating: input.rating,
      comment: input.comment,
    }).select('*').single();
    fail(result.error);
    return {
      id: result.data.id,
      userId: result.data.user_id,
      productId: result.data.product_id,
      authorName: result.data.author_name,
      rating: result.data.rating,
      comment: result.data.comment,
      createdAt: result.data.created_at,
    };
  },
  async deleteReview(id) {
    fail((await sb.from('reviews').delete().eq('id', id)).error);
  },
  async createMessage(input) {
    const result = await sb.from('messages').insert(input).select('*').single();
    fail(result.error);
    return result.data;
  },
  async listMessages() {
    const result = await sb.from('messages').select('*').order('created_at', { ascending: false });
    fail(result.error);
    return result.data;
  },
  async stats() {
    const [orders, products, categories, users] = await Promise.all([
      loadOrders(),
      this.listProducts({ includeUnavailable: true }),
      this.listCategories(),
      this.listUsers(),
    ]);
    return buildStats({ orders, products, categories, users });
  },
};
