<?php

$db = null;
$storeHandle = null;
$storeDirty = false;

function storeOpen(): void
{
    global $db, $storeHandle;
    $file = dirname(__DIR__) . '/data/db.json';
    if (!is_file($file)) {
        fail('Menu database is missing. Copy server/data/db.json into php-api/data/db.json.', 500);
    }
    $storeHandle = fopen($file, 'c+');
    if (!$storeHandle || !flock($storeHandle, LOCK_EX)) {
        fail('Menu database is busy. Try again.', 503);
    }
    $raw = stream_get_contents($storeHandle);
    $decoded = json_decode($raw ?: '', true);
    if (!is_array($decoded)) {
        fail('Menu database is unreadable.', 500);
    }
    $db = $decoded;
}

function storeMark(): void
{
    global $storeDirty;
    $storeDirty = true;
}

function storeClose(): void
{
    global $db, $storeHandle, $storeDirty;
    if ($storeHandle && $storeDirty && is_array($db)) {
        $json = json_encode(normalizeJson($db), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        rewind($storeHandle);
        ftruncate($storeHandle, 0);
        fwrite($storeHandle, $json . "\n");
        fflush($storeHandle);
        $storeDirty = false;
    }
    if ($storeHandle) {
        flock($storeHandle, LOCK_UN);
        fclose($storeHandle);
        $storeHandle = null;
    }
}

function storeDiscard(): void
{
    global $storeDirty;
    $storeDirty = false;
}

function categoryName(string $id): string
{
    global $db;
    foreach ($db['categories'] as $category) {
        if ($category['id'] === $id) {
            return $category['name'];
        }
    }
    return '';
}

function hydrateProduct(array $product): array
{
    global $db;
    $ids = $product['ingredientIds'] ?? [];
    $product['ingredients'] = array_values(array_filter(
        $db['ingredients'],
        fn($ingredient) => in_array($ingredient['id'], $ids, true)
    ));
    $product['category'] = categoryName($product['categoryId']);
    return $product;
}

function publicUser(?array $user): ?array
{
    if (!$user) {
        return null;
    }
    unset($user['passwordHash'], $user['password']);
    return $user;
}

function hydrateOrder(array $order): array
{
    $order['items'] = array_map(function ($item) {
        $item['options'] = $item['options'] ?? [];
        return $item;
    }, $order['items'] ?? []);
    return $order;
}

function listCategories(): array
{
    global $db;
    return $db['categories'];
}

function listProducts(bool $includeUnavailable = false): array
{
    global $db;
    $products = [];
    foreach ($db['products'] as $product) {
        if (!$includeUnavailable && empty($product['isAvailable'])) {
            continue;
        }
        $products[] = hydrateProduct($product);
    }
    return $products;
}

function getProduct(string $id): ?array
{
    global $db;
    foreach ($db['products'] as $product) {
        if ($product['id'] === $id) {
            return hydrateProduct($product);
        }
    }
    return null;
}

function createProduct(array $input): array
{
    global $db;
    $product = array_merge([
        'id' => uuid(),
        'rating' => 4.8,
        'preparationTime' => 15,
        'calories' => 0,
        'isAvailable' => true,
        'isVegetarian' => false,
        'isSpicy' => false,
        'discountPercent' => 0,
        'compareAt' => null,
        'customizer' => 'simple',
        'allergens' => [],
        'ingredientIds' => [],
        'defaults' => [],
        'featured' => false,
        'builder' => false,
        'createdAt' => iso(),
    ], $input);
    array_unshift($db['products'], $product);
    storeMark();
    return hydrateProduct($product);
}

function updateProduct(string $id, array $input): ?array
{
    global $db;
    foreach ($db['products'] as $index => $product) {
        if ($product['id'] !== $id) {
            continue;
        }
        $db['products'][$index] = array_merge($product, $input, ['id' => $id]);
        storeMark();
        return hydrateProduct($db['products'][$index]);
    }
    return null;
}

function deleteProduct(string $id): void
{
    global $db;
    $db['products'] = array_values(array_filter($db['products'], fn($item) => $item['id'] !== $id));
    storeMark();
}

function listIngredients(): array
{
    global $db;
    return $db['ingredients'];
}

function createIngredient(array $input): array
{
    global $db;
    $ingredient = array_merge([
        'id' => uuid(),
        'image' => '',
        'createdAt' => iso(),
    ], $input);
    $db['ingredients'][] = $ingredient;
    storeMark();
    return $ingredient;
}

function updateIngredient(string $id, array $input): ?array
{
    global $db;
    foreach ($db['ingredients'] as $index => $ingredient) {
        if ($ingredient['id'] !== $id) {
            continue;
        }
        $db['ingredients'][$index] = array_merge($ingredient, $input, ['id' => $id]);
        storeMark();
        return $db['ingredients'][$index];
    }
    return null;
}

function deleteIngredient(string $id): void
{
    global $db;
    $db['ingredients'] = array_values(array_filter($db['ingredients'], fn($item) => $item['id'] !== $id));
    foreach ($db['products'] as &$product) {
        $product['ingredientIds'] = array_values(array_filter(
            $product['ingredientIds'] ?? [],
            fn($ingredientId) => $ingredientId !== $id
        ));
    }
    unset($product);
    storeMark();
}

function createCategory(array $input): array
{
    global $db;
    $category = array_merge([
        'id' => uuid(),
        'createdAt' => iso(),
        'image' => '',
    ], $input);
    $db['categories'][] = $category;
    storeMark();
    return $category;
}

function updateCategory(string $id, array $input): ?array
{
    global $db;
    foreach ($db['categories'] as $index => $category) {
        if ($category['id'] !== $id) {
            continue;
        }
        $db['categories'][$index] = array_merge($category, $input, ['id' => $id]);
        storeMark();
        return $db['categories'][$index];
    }
    return null;
}

function deleteCategory(string $id): void
{
    global $db;
    foreach ($db['products'] as $product) {
        if ($product['categoryId'] === $id) {
            fail('Move products out of this category before deleting it.', 400);
        }
    }
    $db['categories'] = array_values(array_filter($db['categories'], fn($item) => $item['id'] !== $id));
    storeMark();
}

function listUsers(): array
{
    global $db;
    return array_map(fn($user) => publicUser($user), $db['users']);
}

function findUserByEmail(string $email): ?array
{
    global $db;
    foreach ($db['users'] as $user) {
        if (strcasecmp($user['email'], $email) === 0) {
            return $user;
        }
    }
    return null;
}

function createUser(array $input): array
{
    global $db;
    $user = array_merge([
        'id' => uuid(),
        'phone' => '',
        'createdAt' => iso(),
    ], $input);
    $db['users'][] = $user;
    storeMark();
    return publicUser($user);
}

function updateUser(string $id, array $input): ?array
{
    global $db;
    foreach ($db['users'] as $index => $user) {
        if ($user['id'] !== $id) {
            continue;
        }
        $db['users'][$index] = array_merge($user, $input, ['id' => $id]);
        storeMark();
        return publicUser($db['users'][$index]);
    }
    return null;
}

function listOrders(): array
{
    global $db;
    $orders = array_map(fn($order) => hydrateOrder($order), $db['orders']);
    usort($orders, fn($a, $b) => strcmp($b['createdAt'], $a['createdAt']));
    return $orders;
}

function getOrder(string $id): ?array
{
    global $db;
    foreach ($db['orders'] as $order) {
        if ($order['id'] === $id) {
            return hydrateOrder($order);
        }
    }
    return null;
}

function createOrderRecord(array $order): array
{
    global $db;
    array_unshift($db['orders'], $order);
    storeMark();
    return hydrateOrder($order);
}

function updateOrderStatus(string $id, string $status): ?array
{
    global $db;
    foreach ($db['orders'] as $index => $order) {
        if ($order['id'] !== $id) {
            continue;
        }
        $db['orders'][$index]['status'] = $status;
        storeMark();
        return hydrateOrder($db['orders'][$index]);
    }
    return null;
}

function listReviews(): array
{
    global $db;
    $reviews = $db['reviews'];
    usort($reviews, fn($a, $b) => strcmp($b['createdAt'], $a['createdAt']));
    return $reviews;
}

function createReview(array $input): array
{
    global $db;
    $review = array_merge(['id' => uuid(), 'createdAt' => iso()], $input);
    array_unshift($db['reviews'], $review);
    storeMark();
    return $review;
}

function deleteReview(string $id): void
{
    global $db;
    $db['reviews'] = array_values(array_filter($db['reviews'], fn($item) => $item['id'] !== $id));
    storeMark();
}

function createMessage(array $input): array
{
    global $db;
    $message = array_merge(['id' => uuid(), 'createdAt' => iso()], $input);
    array_unshift($db['messages'], $message);
    storeMark();
    return $message;
}

function listMessages(): array
{
    global $db;
    return $db['messages'];
}

function appTimezone(): DateTimeZone
{
    global $config;
    try {
        return new DateTimeZone($config['timezone'] ?? 'America/Los_Angeles');
    } catch (Exception $error) {
        return new DateTimeZone('America/Los_Angeles');
    }
}

function orderInstant(array $order): DateTimeImmutable
{
    return new DateTimeImmutable($order['createdAt']);
}

function buildStats(): array
{
    global $db;
    $tz = appTimezone();
    $orders = $db['orders'] ?? [];
    $startOfToday = new DateTimeImmutable('today', $tz);
    $todayOrders = array_values(array_filter($orders, function ($order) use ($startOfToday) {
        return orderInstant($order) >= $startOfToday && ($order['status'] ?? '') !== 'cancelled';
    }));
    $todayRevenue = array_reduce($todayOrders, fn($sum, $order) => $sum + (float) $order['total'], 0);

    $productName = [];
    $categoryByProduct = [];
    foreach ($db['products'] ?? [] as $product) {
        $productName[$product['id']] = $product['name'];
        $categoryByProduct[$product['id']] = $product['categoryId'];
    }
    $categoryNameById = [];
    foreach ($db['categories'] ?? [] as $category) {
        $categoryNameById[$category['id']] = $category['name'];
    }

    $sold = [];
    $byCategory = [];
    foreach ($orders as $order) {
        if (($order['status'] ?? '') === 'cancelled') {
            continue;
        }
        foreach ($order['items'] ?? [] as $item) {
            $id = $item['productId'];
            if (!isset($sold[$id])) {
                $sold[$id] = [
                    'name' => $item['productName'] ?? ($productName[$id] ?? 'Item'),
                    'qty' => 0,
                    'revenue' => 0,
                ];
            }
            $sold[$id]['qty'] += $item['quantity'];
            $sold[$id]['revenue'] += (float) $item['totalPrice'];
            $label = $categoryNameById[$categoryByProduct[$id] ?? ''] ?? 'Other';
            $byCategory[$label] = ($byCategory[$label] ?? 0) + $item['quantity'];
        }
    }

    $bestSellers = array_values($sold);
    usort($bestSellers, fn($a, $b) => $b['qty'] <=> $a['qty']);
    $bestSellers = array_slice($bestSellers, 0, 5);

    $dailySales = [];
    $today = new DateTimeImmutable('today', $tz);
    for ($index = 0; $index < 7; $index++) {
        $day = $today->modify('-' . (6 - $index) . ' days');
        $next = $day->modify('+1 day');
        $slice = array_values(array_filter($orders, function ($order) use ($day, $next) {
            $created = orderInstant($order);
            return $created >= $day && $created < $next && ($order['status'] ?? '') !== 'cancelled';
        }));
        $dailySales[] = [
            'date' => $day->format('D'),
            'total' => roundMoney(array_reduce($slice, fn($sum, $order) => $sum + (float) $order['total'], 0)),
            'orders' => count($slice),
        ];
    }

    $monthlyRevenue = [];
    $monthStart = $today->modify('first day of this month');
    for ($index = 0; $index < 6; $index++) {
        $month = $monthStart->modify('-' . (5 - $index) . ' months');
        $next = $month->modify('+1 month');
        $slice = array_values(array_filter($orders, function ($order) use ($month, $next) {
            $created = orderInstant($order);
            return $created >= $month && $created < $next && ($order['status'] ?? '') !== 'cancelled';
        }));
        $monthlyRevenue[] = [
            'month' => $month->format('M'),
            'total' => roundMoney(array_reduce($slice, fn($sum, $order) => $sum + (float) $order['total'], 0)),
        ];
    }

    $ordersByCategory = [];
    foreach ($byCategory as $name => $count) {
        $ordersByCategory[] = ['name' => $name, 'count' => $count];
    }

    return [
        'todayOrders' => count($todayOrders),
        'todayRevenue' => roundMoney($todayRevenue),
        'totalCustomers' => count(array_filter($db['users'] ?? [], fn($user) => ($user['role'] ?? '') !== 'admin')),
        'bestSellers' => $bestSellers,
        'dailySales' => $dailySales,
        'monthlyRevenue' => $monthlyRevenue,
        'ordersByCategory' => $ordersByCategory,
        'popularProducts' => array_map(fn($item) => ['name' => $item['name'], 'qty' => $item['qty']], $bestSellers),
    ];
}
