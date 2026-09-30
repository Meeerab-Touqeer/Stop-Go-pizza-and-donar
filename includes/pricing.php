<?php

function option_catalog(): array
{
    return [
        'pizza_sizes' => [
            ['id' => 'small', 'name' => 'Small', 'price' => -3],
            ['id' => 'medium', 'name' => 'Medium', 'price' => 0],
            ['id' => 'large', 'name' => 'Large', 'price' => 4],
            ['id' => 'family', 'name' => 'Family', 'price' => 8],
        ],
        'pizza_crusts' => [
            ['id' => 'classic', 'name' => 'Classic', 'price' => 0],
            ['id' => 'thin', 'name' => 'Thin Crust', 'price' => 0],
            ['id' => 'cheese-burst', 'name' => 'Cheese Burst', 'price' => 3],
            ['id' => 'stuffed', 'name' => 'Stuffed Crust', 'price' => 4],
        ],
        'pizza_cheese' => [
            ['id' => 'regular', 'name' => 'Regular', 'price' => 0],
            ['id' => 'extra', 'name' => 'Extra Cheese', 'price' => 2],
            ['id' => 'mozzarella', 'name' => 'Mozzarella', 'price' => 2.5],
            ['id' => 'cheddar', 'name' => 'Cheddar', 'price' => 2.5],
        ],
        'doner_types' => [
            ['id' => 'chicken', 'name' => 'Chicken Doner', 'price' => 0],
            ['id' => 'beef', 'name' => 'Beef Doner', 'price' => 1.5],
            ['id' => 'mixed', 'name' => 'Mixed Doner', 'price' => 2],
        ],
        'doner_breads' => [
            ['id' => 'pita', 'name' => 'Pita', 'price' => 0],
            ['id' => 'turkish', 'name' => 'Turkish Bread', 'price' => 0.75],
            ['id' => 'wrap', 'name' => 'Wrap', 'price' => 0.5],
        ],
        'doner_sizes' => [
            ['id' => 'regular', 'name' => 'Regular', 'price' => 0],
            ['id' => 'large', 'name' => 'Large', 'price' => 3],
            ['id' => 'xl', 'name' => 'XL', 'price' => 5],
        ],
        'doner_sauces' => [
            ['id' => 'garlic', 'name' => 'Garlic', 'price' => 0],
            ['id' => 'spicy', 'name' => 'Spicy', 'price' => 0],
            ['id' => 'mayo', 'name' => 'Mayo', 'price' => 0],
            ['id' => 'bbq', 'name' => 'BBQ', 'price' => 0],
            ['id' => 'house', 'name' => 'House Special', 'price' => 0],
        ],
    ];
}

function pick_option(array $list, string $id): ?array
{
    foreach ($list as $item) {
        if ($item['id'] === $id) {
            return $item;
        }
    }
    return null;
}

function quote_product(array $product, array $selection, array $extras): array
{
    $catalog = option_catalog();
    $options = [];
    $customizer = $product['customizer'];

    if ($customizer === 'pizza') {
        $size = pick_option($catalog['pizza_sizes'], $selection['size'] ?? $product['default_size'] ?: 'medium');
        $crust = pick_option($catalog['pizza_crusts'], $selection['crust'] ?? $product['default_crust'] ?: 'classic');
        $cheese = pick_option($catalog['pizza_cheese'], $selection['cheese'] ?? $product['default_cheese'] ?: 'regular');
        if (!$size || !$crust || !$cheese) {
            throw new RuntimeException('Choose a valid pizza option.');
        }
        $options[] = ['type' => 'size', 'name' => $size['name'], 'price' => $size['price']];
        $options[] = ['type' => 'crust', 'name' => $crust['name'], 'price' => $crust['price']];
        $options[] = ['type' => 'cheese', 'name' => $cheese['name'], 'price' => $cheese['price']];
    } elseif ($customizer === 'doner') {
        $fallback = $product['default_type'] ?: 'chicken';
        $type = pick_option($catalog['doner_types'], $selection['type'] ?? $fallback);
        $bread = pick_option($catalog['doner_breads'], $selection['bread'] ?? $product['default_bread'] ?: 'wrap');
        $size = pick_option($catalog['doner_sizes'], $selection['size'] ?? $product['default_size'] ?: 'regular');
        $sauce = pick_option($catalog['doner_sauces'], $selection['sauce'] ?? $product['default_sauce'] ?: 'garlic');
        $included = pick_option($catalog['doner_types'], $fallback);
        if (!$type || !$bread || !$size || !$sauce || !$included) {
            throw new RuntimeException('Choose a valid doner option.');
        }
        $options[] = ['type' => 'type', 'name' => $type['name'], 'price' => round_money($type['price'] - $included['price'])];
        $options[] = ['type' => 'bread', 'name' => $bread['name'], 'price' => $bread['price']];
        $options[] = ['type' => 'size', 'name' => $size['name'], 'price' => $size['price']];
        $options[] = ['type' => 'sauce', 'name' => $sauce['name'] . ' Sauce', 'price' => $sauce['price']];
    }

    foreach ($extras as $extra) {
        $options[] = ['type' => 'extra', 'name' => $extra['name'], 'price' => (float) $extra['price']];
    }

    $custom = round_money(array_reduce($options, fn($sum, $option) => $sum + (float) $option['price'], 0));
    return [
        'options' => $options,
        'unit_price' => round_money(max(0, (float) $product['base_price'] + $custom)),
    ];
}
