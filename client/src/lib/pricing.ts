import {
  DONER_BREADS,
  DONER_SAUCES,
  DONER_SIZES,
  DONER_TYPES,
  PIZZA_CHEESE,
  PIZZA_CRUSTS,
  PIZZA_SIZES,
  roundMoney,
} from '../data/options';
import type { CartOption, Ingredient, Product, Selection } from '../types';

function pick<T extends { id: string; name: string; price: number }>(list: T[], id: string) {
  return list.find((item) => item.id === id) || list[0];
}

export function emptySelection(product?: Product): Selection {
  return {
    size: product?.defaults.size || (product?.customizer === 'doner' ? 'regular' : 'medium'),
    crust: product?.defaults.crust || 'classic',
    cheese: product?.defaults.cheese || 'regular',
    type: product?.defaults.type || 'chicken',
    bread: product?.defaults.bread || 'wrap',
    sauce: product?.defaults.sauce || 'garlic',
    extraIds: [],
    removed: [],
  };
}

export function extrasFor(product: Product, ingredients: Ingredient[]) {
  return ingredients.filter((item) => item.price > 0 && (item.category === product.customizer || item.category === 'both' || product.builder));
}

export function quote(product: Product, selection: Selection, ingredients: Ingredient[]) {
  const options: CartOption[] = [];

  if (product.customizer === 'pizza' || product.builder) {
    const size = pick(PIZZA_SIZES, selection.size);
    const crust = pick(PIZZA_CRUSTS, selection.crust);
    const cheese = pick(PIZZA_CHEESE, selection.cheese);
    options.push({ type: 'size', name: size.name, price: size.price });
    options.push({ type: 'crust', name: crust.name, price: crust.price });
    options.push({ type: 'cheese', name: cheese.name, price: cheese.price });
  } else if (product.customizer === 'doner') {
    const type = pick(DONER_TYPES, selection.type);
    const bread = pick(DONER_BREADS, selection.bread);
    const size = pick(DONER_SIZES, selection.size);
    const sauce = pick(DONER_SAUCES, selection.sauce);
    const included = pick(DONER_TYPES, product.defaults.type || 'chicken');
    options.push({ type: 'type', name: type.name, price: roundMoney(type.price - included.price) });
    options.push({ type: 'bread', name: bread.name, price: bread.price });
    options.push({ type: 'size', name: size.name, price: size.price });
    options.push({ type: 'sauce', name: `${sauce.name} Sauce`, price: sauce.price });
  }

  selection.extraIds.forEach((id) => {
    const ingredient = ingredients.find((item) => item.id === id);
    if (ingredient) options.push({ type: 'extra', name: ingredient.name, price: ingredient.price });
  });
  selection.removed.forEach((name) => options.push({ type: 'removed', name: `No ${name}`, price: 0 }));

  const customizationPrice = roundMoney(options.reduce((sum, option) => sum + option.price, 0));
  const unitPrice = roundMoney(Math.max(0, product.basePrice + customizationPrice));
  return { options, basePrice: product.basePrice, customizationPrice, unitPrice };
}

export function orderNumber(id: string) {
  const compact = id.replace(/\W/g, '').slice(-6).toUpperCase();
  return `SG-${compact}`;
}
