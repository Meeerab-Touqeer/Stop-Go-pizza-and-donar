function token() {
  try {
    const raw = localStorage.getItem('sg-auth');
    return raw ? (JSON.parse(raw).state?.token as string | null) : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const auth = token();
  if (auth) headers.set('Authorization', `Bearer ${auth}`);
  const response = await fetch(`/api${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export const api = {
  catalog: () => request<CatalogPayload>('/catalog'),
  login: (email: string, password: string) => request<{ token: string; user: import('../types').User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (body: { name: string; email: string; phone: string; password: string }) =>
    request<{ token: string | null; user: import('../types').User }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  session: (accessToken: string) => request<{ token: string; user: import('../types').User }>('/auth/session', { method: 'POST', body: JSON.stringify({ accessToken }) }),
  me: () => request<{ user: import('../types').User }>('/auth/me'),
  createOrder: (body: unknown) => request<{ order: import('../types').Order; eta: string; payment: { configured: boolean; clientSecret?: string; message?: string } }>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  order: (id: string) => request<{ order: import('../types').Order; eta: string }>(`/orders/${id}`),
  contact: (body: { name: string; email: string; message: string }) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
  review: (body: { productId: string; rating: number; comment: string }) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  admin: {
    stats: () => request<import('../types').Stats>('/admin/stats'),
    products: () => request<{ products: import('../types').Product[]; categories: import('../types').Category[]; ingredients: import('../types').Ingredient[] }>('/admin/products'),
    saveProduct: (body: unknown, id?: string) => request(`/admin/products${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) }),
    deleteProduct: (id: string) => request(`/admin/products/${id}`, { method: 'DELETE' }),
    saveCategory: (body: unknown, id?: string) => request(`/admin/categories${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) }),
    deleteCategory: (id: string) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
    saveIngredient: (body: unknown, id?: string) => request(`/admin/ingredients${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) }),
    deleteIngredient: (id: string) => request(`/admin/ingredients/${id}`, { method: 'DELETE' }),
    orders: () => request<{ orders: import('../types').Order[] }>('/admin/orders'),
    status: (id: string, status: string) => request(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    customers: () => request<{ customers: import('../types').User[] }>('/admin/customers'),
    updateCustomer: (id: string, body: unknown) => request(`/admin/customers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    reviews: () => request<{ reviews: import('../types').Review[] }>('/admin/reviews'),
    deleteReview: (id: string) => request(`/admin/reviews/${id}`, { method: 'DELETE' }),
    messages: () => request<{ messages: { id: string; name: string; email: string; message: string; created_at?: string; createdAt?: string }[] }>('/admin/messages'),
  },
};

export type CatalogPayload = {
  products: import('../types').Product[];
  categories: import('../types').Category[];
  ingredients: import('../types').Ingredient[];
  reviews: import('../types').Review[];
};
