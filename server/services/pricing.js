import {
  DONER_BREADS,
  DONER_SAUCES,
  DONER_SIZES,
  DONER_TYPES,
  PIZZA_CHEESE,
  PIZZA_CRUSTS,
  PIZZA_SIZES,
  roundMoney,
} from '../data/options.js';

function pick(list, id, label) {
  const found = list.find((item) => item.id === id);
  if (!found) {
    const error = new Error(`Choose a valid ${label}.`);
    error.status = 400;
    throw error;
  }
  return found;
}

export function quoteProduct(product, selection, ingredients) {
  const options = [];
  const removed = Array.isArray(selection?.removed) ? selection.removed.filter((name) => typeof name === 'string') : [];

  if (product.customizer === 'pizza' || product.builder) {
    const size = pick(PIZZA_SIZES, selection?.size || product.defaults?.size || 'medium', 'size');
    const crust = pick(PIZZA_CRUSTS, selection?.crust || product.defaults?.crust || 'classic', 'crust');
    const cheese = pick(PIZZA_CHEESE, selection?.cheese || product.defaults?.cheese || 'regular', 'cheese');
    options.push({ type: 'size', name: size.name, price: size.price });
    options.push({ type: 'crust', name: crust.name, price: crust.price });
    options.push({ type: 'cheese', name: cheese.name, price: cheese.price });
  } else if (product.customizer === 'doner') {
    const fallbackType = product.defaults?.type || 'chicken';
    const type = pick(DONER_TYPES, selection?.type || fallbackType, 'doner type');
    const bread = pick(DONER_BREADS, selection?.bread || product.defaults?.bread || 'wrap', 'bread');
    const size = pick(DONER_SIZES, selection?.size || product.defaults?.size || 'regular', 'size');
    const sauce = pick(DONER_SAUCES, selection?.sauce || product.defaults?.sauce || 'garlic', 'sauce');
    const included = DONER_TYPES.find((item) => item.id === fallbackType) || DONER_TYPES[0];
    options.push({ type: 'type', name: type.name, price: roundMoney(type.price - included.price) });
    options.push({ type: 'bread', name: bread.name, price: bread.price });
    options.push({ type: 'size', name: size.name, price: size.price });
    options.push({ type: 'sauce', name: `${sauce.name} Sauce`, price: sauce.price });
  }

  const extraIds = Array.isArray(selection?.extraIds) ? selection.extraIds : [];
  extraIds.forEach((id) => {
    const ingredient = ingredients.find((item) => item.id === id && item.price > 0);
    if (!ingredient) {
      const error = new Error('One of the extras is no longer available.');
      error.status = 400;
      throw error;
    }
    const allowed = ingredient.category === product.customizer || ingredient.category === 'both' || product.builder;
    if (!allowed && product.customizer !== 'simple') {
      const error = new Error(`${ingredient.name} cannot be added to this item.`);
      error.status = 400;
      throw error;
    }
    options.push({ type: 'extra', name: ingredient.name, price: Number(ingredient.price) });
  });

  removed.forEach((name) => {
    options.push({ type: 'removed', name: `No ${name}`, price: 0 });
  });

  const customizationPrice = roundMoney(options.reduce((sum, option) => sum + Number(option.price || 0), 0));
  const unitPrice = roundMoney(Math.max(0, Number(product.basePrice) + customizationPrice));

  return {
    options,
    basePrice: roundMoney(product.basePrice),
    customizationPrice,
    unitPrice,
  };
}
