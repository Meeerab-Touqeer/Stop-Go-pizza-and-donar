<?php

function field(array $body, string $key, $default = null)
{
    return array_key_exists($key, $body) ? $body[$key] : $default;
}

function trimmed($value): string
{
    return trim((string) $value);
}

function requireString(array $body, string $key, int $min, int $max, string $label): string
{
    $value = trimmed(field($body, $key, ''));
    if (mb_strlen($value) < $min || mb_strlen($value) > $max) {
        fail($label . ' is not valid.', 400);
    }
    return $value;
}

function optionalString(array $body, string $key, int $max, string $default = ''): string
{
    $value = trimmed(field($body, $key, $default));
    if (mb_strlen($value) > $max) {
        fail($key . ' is too long.', 400);
    }
    return $value;
}

function requireEmail(array $body, string $key = 'email', int $max = 120): string
{
    $value = trimmed(field($body, $key, ''));
    if ($value === '' || !filter_var($value, FILTER_VALIDATE_EMAIL) || mb_strlen($value) > $max) {
        fail('Enter a valid email.', 400);
    }
    return $value;
}

function requireNumber(array $body, string $key, float $min, float $max): float
{
    if (!isset($body[$key]) || !is_numeric($body[$key])) {
        fail($key . ' must be a number.', 400);
    }
    $value = (float) $body[$key];
    if ($value < $min || $value > $max) {
        fail($key . ' is out of range.', 400);
    }
    return $value;
}

function optionalNumber(array $body, string $key, float $min, float $max): ?float
{
    if (!array_key_exists($key, $body) || $body[$key] === null || $body[$key] === '') {
        return null;
    }
    return requireNumber($body, $key, $min, $max);
}

function requireInt(array $body, string $key, int $min, int $max): int
{
    $value = requireNumber($body, $key, $min, $max);
    if ((int) $value !== (int) round($value)) {
        fail($key . ' must be a whole number.', 400);
    }
    return (int) $value;
}

function requireBool(array $body, string $key): bool
{
    if (!array_key_exists($key, $body) || !is_bool($body[$key])) {
        fail($key . ' must be true or false.', 400);
    }
    return $body[$key];
}

function requireEnum(array $body, string $key, array $allowed): string
{
    $value = trimmed(field($body, $key, ''));
    if (!in_array($value, $allowed, true)) {
        fail('Choose a valid ' . $key . '.', 400);
    }
    return $value;
}

function requireUuid(string $value, string $label): string
{
    if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $value)) {
        fail($label . ' is not valid.', 400);
    }
    return $value;
}

function stringList(array $body, string $key, int $maxItems, int $maxLength): array
{
    $list = field($body, $key, []);
    if (!is_array($list) || count($list) > $maxItems) {
        fail($key . ' is not valid.', 400);
    }
    $out = [];
    foreach ($list as $item) {
        $text = trimmed($item);
        if ($text === '' || mb_strlen($text) > $maxLength) {
            fail($key . ' is not valid.', 400);
        }
        $out[] = $text;
    }
    return $out;
}

function parseRegister(array $body): array
{
    return [
        'name' => requireString($body, 'name', 2, 80, 'Name'),
        'email' => requireEmail($body),
        'phone' => optionalString($body, 'phone', 24),
        'password' => requireString($body, 'password', 8, 72, 'Password'),
    ];
}

function parseLogin(array $body): array
{
    return [
        'email' => requireEmail($body),
        'password' => requireString($body, 'password', 1, 72, 'Password'),
    ];
}

function parseSelection($selection): array
{
    if ($selection === null) {
        return [];
    }
    if (!is_array($selection)) {
        fail('Customization is not valid.', 400);
    }
    $out = [];
    foreach (['size', 'crust', 'cheese', 'type', 'bread', 'sauce'] as $key) {
        if (isset($selection[$key])) {
            $out[$key] = optionalString($selection, $key, 40);
        }
    }
    if (isset($selection['extraIds'])) {
        $ids = $selection['extraIds'];
        if (!is_array($ids) || count($ids) > 24) {
            fail('Too many extras.', 400);
        }
        $out['extraIds'] = array_map(fn($id) => requireUuid((string) $id, 'Extra'), $ids);
    }
    if (isset($selection['removed'])) {
        $out['removed'] = stringList($selection, 'removed', 24, 40);
    }
    return $out;
}

function parseOrder(array $body): array
{
    foreach (['customer', 'delivery', 'items'] as $key) {
        if (!isset($body[$key]) || !is_array($body[$key])) {
            fail('Check the form and try again.', 400);
        }
    }
    $items = $body['items'];
    if (!array_is_list($items) || count($items) < 1 || count($items) > 30) {
        fail('Add at least one item.', 400);
    }
    $parsedItems = [];
    foreach ($items as $item) {
        if (!is_array($item)) {
            fail('An item in the cart is not valid.', 400);
        }
        $parsedItems[] = [
            'productId' => requireUuid(trimmed($item['productId'] ?? ''), 'Product'),
            'quantity' => requireInt($item, 'quantity', 1, 20),
            'selection' => parseSelection($item['selection'] ?? null),
        ];
    }
    return [
        'customer' => [
            'name' => requireString($body['customer'], 'name', 2, 80, 'Name'),
            'email' => requireEmail($body['customer']),
            'phone' => requireString($body['customer'], 'phone', 7, 24, 'Phone'),
        ],
        'delivery' => [
            'address' => requireString($body['delivery'], 'address', 5, 160, 'Address'),
            'city' => requireString($body['delivery'], 'city', 2, 80, 'City'),
            'postalCode' => requireString($body['delivery'], 'postalCode', 3, 16, 'Postal code'),
            'instructions' => optionalString($body['delivery'], 'instructions', 240),
        ],
        'paymentMethod' => requireEnum($body, 'paymentMethod', ['cod', 'card', 'stripe']),
        'discountCode' => optionalString($body, 'discountCode', 20),
        'items' => $parsedItems,
    ];
}

function parseProduct(array $body): array
{
    $defaults = field($body, 'defaults', []);
    if (!is_array($defaults)) {
        fail('Defaults are not valid.', 400);
    }
    $cleanDefaults = [];
    foreach ($defaults as $key => $value) {
        if (!is_string($key) || !is_string($value)) {
            fail('Defaults are not valid.', 400);
        }
        $cleanDefaults[$key] = $value;
    }
    $ingredientIds = field($body, 'ingredientIds', []);
    if (!is_array($ingredientIds) || count($ingredientIds) > 30) {
        fail('Ingredients are not valid.', 400);
    }
    return [
        'categoryId' => requireUuid(trimmed($body['categoryId'] ?? ''), 'Category'),
        'name' => requireString($body, 'name', 2, 80, 'Name'),
        'description' => requireString($body, 'description', 4, 400, 'Description'),
        'basePrice' => requireNumber($body, 'basePrice', 0, 500),
        'compareAt' => optionalNumber($body, 'compareAt', 0, 500),
        'image' => optionalString($body, 'image', 300),
        'rating' => array_key_exists('rating', $body) ? requireNumber($body, 'rating', 0, 5) : 4.8,
        'preparationTime' => requireInt($body, 'preparationTime', 1, 180),
        'calories' => requireInt($body, 'calories', 0, 8000),
        'isAvailable' => requireBool($body, 'isAvailable'),
        'isVegetarian' => requireBool($body, 'isVegetarian'),
        'isSpicy' => requireBool($body, 'isSpicy'),
        'discountPercent' => array_key_exists('discountPercent', $body) ? requireInt($body, 'discountPercent', 0, 90) : 0,
        'customizer' => requireEnum($body, 'customizer', ['pizza', 'doner', 'simple']),
        'allergens' => isset($body['allergens']) ? stringList($body, 'allergens', 12, 40) : [],
        'ingredientIds' => array_map(fn($id) => requireUuid((string) $id, 'Ingredient'), $ingredientIds),
        'featured' => !empty($body['featured']),
        'builder' => !empty($body['builder']),
        'defaults' => $cleanDefaults,
    ];
}

function parseIngredient(array $body): array
{
    return [
        'name' => requireString($body, 'name', 2, 60, 'Name'),
        'price' => requireNumber($body, 'price', 0, 50),
        'category' => requireEnum($body, 'category', ['base', 'pizza', 'doner', 'both']),
        'image' => optionalString($body, 'image', 300),
    ];
}

function parseCategory(array $body): array
{
    $slug = requireString($body, 'slug', 2, 40, 'Slug');
    if (!preg_match('/^[a-z0-9-]+$/', $slug)) {
        fail('Slug may use lowercase letters, numbers, and dashes.', 400);
    }
    return [
        'name' => requireString($body, 'name', 2, 40, 'Name'),
        'slug' => $slug,
        'description' => optionalString($body, 'description', 180),
        'image' => optionalString($body, 'image', 300),
    ];
}

function parseReview(array $body): array
{
    return [
        'productId' => requireUuid(trimmed($body['productId'] ?? ''), 'Product'),
        'rating' => requireInt($body, 'rating', 1, 5),
        'comment' => requireString($body, 'comment', 4, 400, 'Comment'),
    ];
}

function parseContact(array $body): array
{
    return [
        'name' => requireString($body, 'name', 2, 80, 'Name'),
        'email' => requireEmail($body),
        'message' => requireString($body, 'message', 8, 800, 'Message'),
    ];
}

function parseStatus(array $body): string
{
    return requireEnum($body, 'status', ['received', 'preparing', 'cooking', 'out_for_delivery', 'delivered', 'cancelled']);
}

function parseUserUpdate(array $body): array
{
    return [
        'name' => requireString($body, 'name', 2, 80, 'Name'),
        'phone' => optionalString($body, 'phone', 24),
        'role' => requireEnum($body, 'role', ['customer', 'admin']),
    ];
}
