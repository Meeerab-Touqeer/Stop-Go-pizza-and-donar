export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
};

export type Ingredient = {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
};

export type Product = {
  id: string;
  categoryId: string;
  category: string;
  name: string;
  description: string;
  basePrice: number;
  compareAt: number | null;
  image: string;
  rating: number;
  preparationTime: number;
  calories: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  discountPercent: number;
  customizer: 'pizza' | 'doner' | 'simple';
  allergens: string[];
  ingredientIds: string[];
  ingredients: Ingredient[];
  defaults: Record<string, string>;
  featured: boolean;
  builder: boolean;
};

export type Selection = {
  size: string;
  crust: string;
  cheese: string;
  type: string;
  bread: string;
  sauce: string;
  extraIds: string[];
  removed: string[];
};

export type CartOption = { type: string; name: string; price: number };

export type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  basePrice: number;
  customizationPrice: number;
  unitPrice: number;
  options: CartOption[];
  selection: Selection;
};

export type Review = {
  id: string;
  userId: string | null;
  productId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
};

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  image: string;
  quantity: number;
  basePrice: number;
  customizationPrice: number;
  totalPrice: number;
  options: CartOption[];
};

export type Order = {
  id: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  discountCode?: string;
  tax: number;
  total: number;
  status: string;
  paymentMethod: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  createdAt: string;
  items: OrderItem[];
};

export type Stats = {
  todayOrders: number;
  todayRevenue: number;
  totalCustomers: number;
  bestSellers: { name: string; qty: number; revenue: number }[];
  dailySales: { date: string; total: number; orders: number }[];
  monthlyRevenue: { month: string; total: number }[];
  ordersByCategory: { name: string; count: number }[];
  popularProducts: { name: string; qty: number }[];
};
