import { create } from 'zustand';
import { api } from '../services/api';
import type { Category, Ingredient, Product, Review } from '../types';

type CatalogState = {
  products: Product[];
  categories: Category[];
  ingredients: Ingredient[];
  reviews: Review[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string;
  load: (force?: boolean) => Promise<void>;
};

export const useCatalog = create<CatalogState>((set, get) => ({
  products: [],
  categories: [],
  ingredients: [],
  reviews: [],
  status: 'idle',
  error: '',
  async load(force = false) {
    if (!force && (get().status === 'ready' || get().status === 'loading')) return;
    set({ status: 'loading', error: '' });
    try {
      const data = await api.catalog();
      set({ ...data, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : 'Menu unavailable' });
    }
  },
}));
