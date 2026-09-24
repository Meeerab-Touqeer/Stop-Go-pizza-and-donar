<?php

const PIZZA_SIZES = [
    ['id' => 'small', 'name' => 'Small', 'price' => -3],
    ['id' => 'medium', 'name' => 'Medium', 'price' => 0],
    ['id' => 'large', 'name' => 'Large', 'price' => 4],
    ['id' => 'family', 'name' => 'Family', 'price' => 8],
];

const PIZZA_CRUSTS = [
    ['id' => 'classic', 'name' => 'Classic', 'price' => 0],
    ['id' => 'thin', 'name' => 'Thin Crust', 'price' => 0],
    ['id' => 'cheese-burst', 'name' => 'Cheese Burst', 'price' => 3],
    ['id' => 'stuffed', 'name' => 'Stuffed Crust', 'price' => 4],
];

const PIZZA_CHEESE = [
    ['id' => 'regular', 'name' => 'Regular', 'price' => 0],
    ['id' => 'extra', 'name' => 'Extra Cheese', 'price' => 2],
    ['id' => 'mozzarella', 'name' => 'Mozzarella', 'price' => 2.5],
    ['id' => 'cheddar', 'name' => 'Cheddar', 'price' => 2.5],
];

const DONER_TYPES = [
    ['id' => 'chicken', 'name' => 'Chicken Doner', 'price' => 0],
    ['id' => 'beef', 'name' => 'Beef Doner', 'price' => 1.5],
    ['id' => 'mixed', 'name' => 'Mixed Doner', 'price' => 2],
];

const DONER_BREADS = [
    ['id' => 'pita', 'name' => 'Pita', 'price' => 0],
    ['id' => 'turkish', 'name' => 'Turkish Bread', 'price' => 0.75],
    ['id' => 'wrap', 'name' => 'Wrap', 'price' => 0.5],
];

const DONER_SIZES = [
    ['id' => 'regular', 'name' => 'Regular', 'price' => 0],
    ['id' => 'large', 'name' => 'Large', 'price' => 3],
    ['id' => 'xl', 'name' => 'XL', 'price' => 5],
];

const DONER_SAUCES = [
    ['id' => 'garlic', 'name' => 'Garlic', 'price' => 0],
    ['id' => 'spicy', 'name' => 'Spicy', 'price' => 0],
    ['id' => 'mayo', 'name' => 'Mayo', 'price' => 0],
    ['id' => 'bbq', 'name' => 'BBQ', 'price' => 0],
    ['id' => 'house', 'name' => 'House Special', 'price' => 0],
];

const DELIVERY_FEE = 3.5;
const TAX_RATE = 0.08;

function roundMoney($value): float
{
    return round(((float) $value) + PHP_FLOAT_EPSILON, 2);
}
