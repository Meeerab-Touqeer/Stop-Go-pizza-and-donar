import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(24).optional().default(''),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72),
});

export const selectionSchema = z.object({
  size: z.string().max(40).optional(),
  crust: z.string().max(40).optional(),
  cheese: z.string().max(40).optional(),
  type: z.string().max(40).optional(),
  bread: z.string().max(40).optional(),
  sauce: z.string().max(40).optional(),
  extraIds: z.array(z.string().uuid()).max(24).optional(),
  removed: z.array(z.string().max(40)).max(24).optional(),
}).optional();

export const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().min(7).max(24),
  }),
  delivery: z.object({
    address: z.string().trim().min(5).max(160),
    city: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().min(3).max(16),
    instructions: z.string().trim().max(240).optional().default(''),
  }),
  paymentMethod: z.enum(['cod', 'card', 'stripe']),
  discountCode: z.string().trim().max(20).optional().default(''),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(20),
    selection: selectionSchema,
  })).min(1).max(30),
});

export const productSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(4).max(400),
  basePrice: z.number().min(0).max(500),
  compareAt: z.number().min(0).max(500).nullable().optional(),
  image: z.string().max(300).optional().default(''),
  rating: z.number().min(0).max(5).optional(),
  preparationTime: z.number().int().min(1).max(180),
  calories: z.number().int().min(0).max(8000),
  isAvailable: z.boolean(),
  isVegetarian: z.boolean(),
  isSpicy: z.boolean(),
  discountPercent: z.number().int().min(0).max(90).optional(),
  customizer: z.enum(['pizza', 'doner', 'simple']),
  allergens: z.array(z.string().max(40)).max(12).optional(),
  ingredientIds: z.array(z.string().uuid()).max(30).optional(),
  featured: z.boolean().optional(),
  builder: z.boolean().optional(),
  defaults: z.record(z.string()).optional(),
});

export const ingredientSchema = z.object({
  name: z.string().trim().min(2).max(60),
  price: z.number().min(0).max(50),
  category: z.enum(['base', 'pizza', 'doner', 'both']),
  image: z.string().max(300).optional().default(''),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(40),
  slug: z.string().trim().min(2).max(40).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(180).optional().default(''),
  image: z.string().max(300).optional().default(''),
});

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(4).max(400),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  message: z.string().trim().min(8).max(800),
});

export const statusSchema = z.object({
  status: z.enum(['received', 'preparing', 'cooking', 'out_for_delivery', 'delivered', 'cancelled']),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(24).optional().default(''),
  role: z.enum(['customer', 'admin']),
});

export function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || 'Check the form and try again.');
    error.status = 400;
    throw error;
  }
  return result.data;
}
