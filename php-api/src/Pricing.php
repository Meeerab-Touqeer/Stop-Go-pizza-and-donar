<?php

function pickOption(array $list, ?string $id, string $label): array
{
    foreach ($list as $item) {
        if (($item['id'] ?? null) === $id) {
            return $item;
        }
    }
    fail('Choose a valid ' . $label . '.', 400);
}

function quoteProduct(array $product, array $selection, array $ingredients): array
{
    $options = [];
    $removed = array_values(array_filter($selection['removed'] ?? [], 'is_string'));
    $defaults = is_array($product['defaults'] ?? null) ? $product['defaults'] : [];

    if (($product['customizer'] ?? '') === 'pizza' || !empty($product['builder'])) {
        $size = pickOption(PIZZA_SIZES, $selection['size'] ?? ($defaults['size'] ?? 'medium'), 'size');
        $crust = pickOption(PIZZA_CRUSTS, $selection['crust'] ?? ($defaults['crust'] ?? 'classic'), 'crust');
        $cheese = pickOption(PIZZA_CHEESE, $selection['cheese'] ?? ($defaults['cheese'] ?? 'regular'), 'cheese');
        $options[] = ['type' => 'size', 'name' => $size['name'], 'price' => $size['price']];
        $options[] = ['type' => 'crust', 'name' => $crust['name'], 'price' => $crust['price']];
        $options[] = ['type' => 'cheese', 'name' => $cheese['name'], 'price' => $cheese['price']];
    } elseif (($product['customizer'] ?? '') === 'doner') {
        $fallbackType = $defaults['type'] ?? 'chicken';
        $type = pickOption(DONER_TYPES, $selection['type'] ?? $fallbackType, 'doner type');
        $bread = pickOption(DONER_BREADS, $selection['bread'] ?? ($defaults['bread'] ?? 'wrap'), 'bread');
        $size = pickOption(DONER_SIZES, $selection['size'] ?? ($defaults['size'] ?? 'regular'), 'size');
        $sauce = pickOption(DONER_SAUCES, $selection['sauce'] ?? ($defaults['sauce'] ?? 'garlic'), 'sauce');
        $included = pickOption(DONER_TYPES, $fallbackType, 'doner type');
        $options[] = ['type' => 'type', 'name' => $type['name'], 'price' => roundMoney($type['price'] - $included['price'])];
        $options[] = ['type' => 'bread', 'name' => $bread['name'], 'price' => $bread['price']];
        $options[] = ['type' => 'size', 'name' => $size['name'], 'price' => $size['price']];
        $options[] = ['type' => 'sauce', 'name' => $sauce['name'] . ' Sauce', 'price' => $sauce['price']];
    }

    foreach ($selection['extraIds'] ?? [] as $id) {
        $ingredient = null;
        foreach ($ingredients as $item) {
            if ($item['id'] === $id && (float) $item['price'] > 0) {
                $ingredient = $item;
                break;
            }
        }
        if (!$ingredient) {
            fail('One of the extras is no longer available.', 400);
        }
        $allowed = $ingredient['category'] === ($product['customizer'] ?? '') || $ingredient['category'] === 'both' || !empty($product['builder']);
        if (!$allowed && ($product['customizer'] ?? '') !== 'simple') {
            fail($ingredient['name'] . ' cannot be added to this item.', 400);
        }
        $options[] = ['type' => 'extra', 'name' => $ingredient['name'], 'price' => (float) $ingredient['price']];
    }

    foreach ($removed as $name) {
        $options[] = ['type' => 'removed', 'name' => 'No ' . $name, 'price' => 0];
    }

    $customizationPrice = roundMoney(array_reduce($options, fn($sum, $option) => $sum + (float) ($option['price'] ?? 0), 0));
    $unitPrice = roundMoney(max(0, (float) $product['basePrice'] + $customizationPrice));
    return [
        'options' => $options,
        'basePrice' => roundMoney($product['basePrice']),
        'customizationPrice' => $customizationPrice,
        'unitPrice' => $unitPrice,
    ];
}
