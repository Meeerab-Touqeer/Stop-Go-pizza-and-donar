import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine, Product, Selection } from '../types';
import { quote } from '../lib/pricing';
import { flyToCart } from '../lib/fly';
import { useUi } from './useUi';
import type { Ingredient } from '../types';

type CartState = {
  lines: CartLine[];
  add: (product: Product, selection: Selection, ingredients: Ingredient[], quantity: number, source?: HTMLElement | null, lineId?: string) => void;
  setQty: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
};

function signature(productId: string, selection: Selection) {
  return [productId, selection.size, selection.crust, selection.cheese, selection.type, selection.bread, selection.sauce, [...selection.extraIds].sort().join(','), [...selection.removed].sort().join(',')].join('|');
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add(product, selection, ingredients, quantity, source, lineId) {
        const quoted = quote(product, selection, ingredients);
        const key = signature(product.id, selection);
        const lines = get().lines.filter((line) => line.lineId !== lineId);
        const existing = lines.find((line) => signature(line.productId, line.selection) === key);
        if (existing) {
          existing.quantity = Math.min(20, existing.quantity + quantity);
          existing.unitPrice = quoted.unitPrice;
          existing.basePrice = quoted.basePrice;
          existing.customizationPrice = quoted.customizationPrice;
          existing.options = quoted.options;
        } else {
          lines.push({
            lineId: lineId || crypto.randomUUID(),
            productId: product.id,
            name: product.name,
            image: product.image,
            quantity,
            basePrice: quoted.basePrice,
            customizationPrice: quoted.customizationPrice,
            unitPrice: quoted.unitPrice,
            options: quoted.options,
            selection,
          });
        }
        set({ lines: [...lines] });
        if (source) flyToCart(source);
        useUi.getState().toast('Added to your order');
      },
      setQty(lineId, quantity) {
        set({
          lines: get().lines
            .map((line) => (line.lineId === lineId ? { ...line, quantity } : line))
            .filter((line) => line.quantity > 0),
        });
      },
      remove(lineId) {
        set({ lines: get().lines.filter((line) => line.lineId !== lineId) });
      },
      clear() {
        set({ lines: [] });
      },
    }),
    { name: 'sg-cart' },
  ),
);

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]) {
  return Math.round(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0) * 100) / 100;
}
