<?php

function stripeIntent(float $total, string $email): array
{
    global $config;
    $key = trim((string) ($config['stripe_secret_key'] ?? ''));
    if ($key === '') {
        return ['configured' => false];
    }
    if (!function_exists('curl_init')) {
        return ['configured' => false, 'message' => 'Card payments are not available on this server.'];
    }
    $ch = curl_init('https://api.stripe.com/v1/payment_intents');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_USERPWD => $key . ':',
        CURLOPT_POSTFIELDS => http_build_query([
            'amount' => (int) round($total * 100),
            'currency' => 'usd',
            'receipt_email' => $email,
            'automatic_payment_methods[enabled]' => 'true',
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
    ]);
    $raw = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $data = json_decode($raw ?: '', true);
    if ($code >= 200 && $code < 300 && !empty($data['client_secret'])) {
        return ['configured' => true, 'clientSecret' => $data['client_secret']];
    }
    return ['configured' => false, 'message' => $data['error']['message'] ?? 'Stripe request failed.'];
}

function actionHealth(): void
{
    jsonOut(['ok' => true, 'brand' => 'STOP&GO']);
}

function actionCatalog(): void
{
    jsonOut([
        'categories' => listCategories(),
        'products' => listProducts(),
        'ingredients' => listIngredients(),
        'reviews' => listReviews(),
    ]);
}

function actionProduct(string $id): void
{
    $found = getProduct($id);
    if (!$found || empty($found['isAvailable'])) {
        fail('That item is not on the menu.', 404);
    }
    $reviews = array_values(array_filter(listReviews(), fn($review) => $review['productId'] === $found['id']));
    jsonOut(['product' => $found, 'reviews' => $reviews]);
}

function actionContact(): void
{
    createMessage(parseContact(readJsonBody()));
    jsonOut(['ok' => true], 201);
}

function actionRegister(): void
{
    rateLimit('auth', 12, 600);
    $body = parseRegister(readJsonBody());
    if (findUserByEmail($body['email'])) {
        fail('An account with that email already exists.', 409);
    }
    $user = createUser([
        'name' => $body['name'],
        'email' => strtolower($body['email']),
        'phone' => $body['phone'],
        'role' => 'customer',
        'passwordHash' => password_hash($body['password'], PASSWORD_BCRYPT),
    ]);
    jsonOut(['token' => signUser($user), 'user' => $user], 201);
}

function actionLogin(): void
{
    rateLimit('auth', 12, 600);
    $body = parseLogin(readJsonBody());
    $record = findUserByEmail($body['email']);
    if (!$record || empty($record['passwordHash']) || !password_verify($body['password'], $record['passwordHash'])) {
        fail('Email or password is incorrect.', 401);
    }
    $user = publicUser($record);
    jsonOut(['token' => signUser($user), 'user' => $user]);
}

function actionSession(): void
{
    $body = readJsonBody();
    if (empty($body['accessToken'])) {
        fail('Missing access token.', 400);
    }
    fail('Google sign-in needs Supabase keys.', 400);
}

function actionMe(): void
{
    jsonOut(['user' => requireUser()]);
}

function actionReview(): void
{
    $user = requireUser();
    $body = parseReview(readJsonBody());
    if (!getProduct($body['productId'])) {
        fail('That item is not on the menu.', 404);
    }
    $review = createReview([
        'userId' => $user['id'],
        'productId' => $body['productId'],
        'authorName' => $user['name'],
        'rating' => $body['rating'],
        'comment' => $body['comment'],
    ]);
    jsonOut(['review' => $review], 201);
}

function actionCreateOrder(): void
{
    $user = optionalUser();
    $body = parseOrder(readJsonBody());
    $ingredients = listIngredients();
    $items = [];
    foreach ($body['items'] as $entry) {
        $product = getProduct($entry['productId']);
        if (!$product || empty($product['isAvailable'])) {
            fail('One item in your cart is no longer available.', 400);
        }
        $quote = quoteProduct($product, $entry['selection'], $ingredients);
        $items[] = [
            'id' => uuid(),
            'productId' => $product['id'],
            'productName' => $product['name'],
            'image' => $product['image'],
            'quantity' => $entry['quantity'],
            'basePrice' => $quote['basePrice'],
            'customizationPrice' => $quote['customizationPrice'],
            'totalPrice' => roundMoney($quote['unitPrice'] * $entry['quantity']),
            'options' => $quote['options'],
        ];
    }

    $subtotal = roundMoney(array_reduce($items, fn($sum, $item) => $sum + $item['totalPrice'], 0));
    $code = strtoupper($body['discountCode']);
    $discount = $code === 'STOP10' ? roundMoney($subtotal * 0.1) : 0;
    if ($body['discountCode'] !== '' && $code !== 'STOP10') {
        fail('That discount code is not active.', 400);
    }
    $deliveryFee = DELIVERY_FEE;
    $tax = roundMoney(($subtotal - $discount) * TAX_RATE);
    $total = roundMoney($subtotal - $discount + $deliveryFee + $tax);
    $address = $body['delivery']['address'] . ', ' . $body['delivery']['city'] . ', ' . $body['delivery']['postalCode'];

    $payment = ['configured' => true];
    if ($body['paymentMethod'] === 'stripe') {
        $payment = stripeIntent($total, $body['customer']['email']);
    }

    $order = createOrderRecord([
        'id' => uuid(),
        'userId' => is_array($user) ? $user['id'] : null,
        'customerName' => $body['customer']['name'],
        'customerEmail' => $body['customer']['email'],
        'customerPhone' => $body['customer']['phone'],
        'subtotal' => $subtotal,
        'deliveryFee' => $deliveryFee,
        'discount' => $discount,
        'discountCode' => $code === 'STOP10' ? $code : '',
        'tax' => $tax,
        'total' => $total,
        'status' => 'preparing',
        'paymentMethod' => $body['paymentMethod'],
        'deliveryAddress' => $address,
        'deliveryInstructions' => $body['delivery']['instructions'],
        'createdAt' => iso(),
        'items' => $items,
    ]);

    jsonOut([
        'order' => $order,
        'eta' => iso(new DateTimeImmutable('+35 minutes')),
        'payment' => $payment,
    ], 201);
}

function actionGetOrder(string $id): void
{
    $user = optionalUser();
    $order = getOrder($id);
    if (!$order) {
        fail('Order not found.', 404);
    }
    if ($user && ($user['role'] ?? '') !== 'admin' && !empty($order['userId']) && $order['userId'] !== $user['id']) {
        fail('That order belongs to another account.', 403);
    }
    $created = new DateTimeImmutable($order['createdAt']);
    jsonOut([
        'order' => $order,
        'eta' => iso($created->modify('+35 minutes')),
    ]);
}

function actionAdminStats(): void
{
    requireAdmin();
    jsonOut(buildStats());
}

function actionAdminProducts(): void
{
    requireAdmin();
    jsonOut([
        'products' => listProducts(true),
        'categories' => listCategories(),
        'ingredients' => listIngredients(),
    ]);
}

function actionAdminCreateProduct(): void
{
    requireAdmin();
    jsonOut(['product' => createProduct(parseProduct(readJsonBody()))], 201);
}

function actionAdminUpdateProduct(string $id): void
{
    requireAdmin();
    $product = updateProduct($id, parseProduct(readJsonBody()));
    if (!$product) {
        fail('Product not found.', 404);
    }
    jsonOut(['product' => $product]);
}

function actionAdminDeleteProduct(string $id): void
{
    requireAdmin();
    deleteProduct($id);
    jsonOut(['ok' => true]);
}

function actionAdminCreateCategory(): void
{
    requireAdmin();
    jsonOut(['category' => createCategory(parseCategory(readJsonBody()))], 201);
}

function actionAdminUpdateCategory(string $id): void
{
    requireAdmin();
    $category = updateCategory($id, parseCategory(readJsonBody()));
    if (!$category) {
        fail('Category not found.', 404);
    }
    jsonOut(['category' => $category]);
}

function actionAdminDeleteCategory(string $id): void
{
    requireAdmin();
    deleteCategory($id);
    jsonOut(['ok' => true]);
}

function actionAdminCreateIngredient(): void
{
    requireAdmin();
    jsonOut(['ingredient' => createIngredient(parseIngredient(readJsonBody()))], 201);
}

function actionAdminUpdateIngredient(string $id): void
{
    requireAdmin();
    $ingredient = updateIngredient($id, parseIngredient(readJsonBody()));
    if (!$ingredient) {
        fail('Ingredient not found.', 404);
    }
    jsonOut(['ingredient' => $ingredient]);
}

function actionAdminDeleteIngredient(string $id): void
{
    requireAdmin();
    deleteIngredient($id);
    jsonOut(['ok' => true]);
}

function actionAdminOrders(): void
{
    requireAdmin();
    jsonOut(['orders' => listOrders()]);
}

function actionAdminUpdateOrder(string $id): void
{
    requireAdmin();
    $order = updateOrderStatus($id, parseStatus(readJsonBody()));
    if (!$order) {
        fail('Order not found.', 404);
    }
    jsonOut(['order' => $order]);
}

function actionAdminCustomers(): void
{
    requireAdmin();
    jsonOut(['customers' => listUsers()]);
}

function actionAdminUpdateCustomer(string $id): void
{
    requireAdmin();
    $user = updateUser($id, parseUserUpdate(readJsonBody()));
    if (!$user) {
        fail('Customer not found.', 404);
    }
    jsonOut(['user' => $user]);
}

function actionAdminReviews(): void
{
    requireAdmin();
    jsonOut(['reviews' => listReviews()]);
}

function actionAdminDeleteReview(string $id): void
{
    requireAdmin();
    deleteReview($id);
    jsonOut(['ok' => true]);
}

function actionAdminMessages(): void
{
    requireAdmin();
    jsonOut(['messages' => listMessages()]);
}
