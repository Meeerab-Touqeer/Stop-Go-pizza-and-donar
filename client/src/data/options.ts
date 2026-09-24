export const PIZZA_SIZES = [
  { id: 'small', name: 'Small', price: -3 },
  { id: 'medium', name: 'Medium', price: 0 },
  { id: 'large', name: 'Large', price: 4 },
  { id: 'family', name: 'Family', price: 8 },
];

export const PIZZA_CRUSTS = [
  { id: 'classic', name: 'Classic', price: 0 },
  { id: 'thin', name: 'Thin Crust', price: 0 },
  { id: 'cheese-burst', name: 'Cheese Burst', price: 3 },
  { id: 'stuffed', name: 'Stuffed Crust', price: 4 },
];

export const PIZZA_CHEESE = [
  { id: 'regular', name: 'Regular', price: 0 },
  { id: 'extra', name: 'Extra Cheese', price: 2 },
  { id: 'mozzarella', name: 'Mozzarella', price: 2.5 },
  { id: 'cheddar', name: 'Cheddar', price: 2.5 },
];

export const DONER_TYPES = [
  { id: 'chicken', name: 'Chicken Doner', price: 0 },
  { id: 'beef', name: 'Beef Doner', price: 1.5 },
  { id: 'mixed', name: 'Mixed Doner', price: 2 },
];

export const DONER_BREADS = [
  { id: 'pita', name: 'Pita', price: 0 },
  { id: 'turkish', name: 'Turkish Bread', price: 0.75 },
  { id: 'wrap', name: 'Wrap', price: 0.5 },
];

export const DONER_SIZES = [
  { id: 'regular', name: 'Regular', price: 0 },
  { id: 'large', name: 'Large', price: 3 },
  { id: 'xl', name: 'XL', price: 5 },
];

export const DONER_SAUCES = [
  { id: 'garlic', name: 'Garlic', price: 0 },
  { id: 'spicy', name: 'Spicy', price: 0 },
  { id: 'mayo', name: 'Mayo', price: 0 },
  { id: 'bbq', name: 'BBQ', price: 0 },
  { id: 'house', name: 'House Special', price: 0 },
];

export const BUILD_TOPPINGS = [
  { id: 'pepperoni', name: 'Pepperoni', price: 3, ingredientName: 'Pepperoni' },
  { id: 'mushrooms', name: 'Mushrooms', price: 1.5, ingredientName: 'Mushrooms' },
  { id: 'cheese', name: 'Extra Cheese', price: 2, ingredientName: 'Extra Cheese' },
  { id: 'jalapenos', name: 'Jalapeños', price: 1.25, ingredientName: 'Jalapeños' },
  { id: 'olives', name: 'Olives', price: 1.5, ingredientName: 'Olives' },
  { id: 'chicken', name: 'Chicken', price: 3, ingredientName: 'Chicken' },
  { id: 'beef', name: 'Beef', price: 3.5, ingredientName: 'Beef' },
  { id: 'onions', name: 'Onions', price: 1, ingredientName: 'Onions' },
  { id: 'peppers', name: 'Bell Peppers', price: 1.25, ingredientName: 'Bell Peppers' },
];

export const DELIVERY_FEE = 3.5;
export const TAX_RATE = 0.08;

export function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
