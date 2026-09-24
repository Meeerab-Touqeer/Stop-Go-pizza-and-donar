<?php

require __DIR__ . '/src/bootstrap.php';

$origin = $config['client_origin'] ?? '*';
header('Access-Control-Allow-Origin: ' . ($origin !== '' ? $origin : '*'));
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Vary: Origin');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    storeOpen();
    dispatch();
    storeClose();
} catch (ApiException $error) {
    storeClose();
    jsonOut(['error' => $error->getMessage()], $error->status);
} catch (Throwable $error) {
    error_log($error->getMessage());
    storeDiscard();
    storeClose();
    jsonOut(['error' => 'Something went wrong. Please try again.'], 500);
}

function dispatch(): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $path = requestPath();

    if ($method === 'GET' && $path === '/health') {
        actionHealth();
    }
    if ($method === 'GET' && $path === '/catalog') {
        actionCatalog();
    }
    if ($method === 'GET' && preg_match('#^/products/([^/]+)$#', $path, $match)) {
        actionProduct($match[1]);
    }
    if ($method === 'POST' && $path === '/contact') {
        actionContact();
    }
    if ($method === 'POST' && $path === '/auth/register') {
        actionRegister();
    }
    if ($method === 'POST' && $path === '/auth/login') {
        actionLogin();
    }
    if ($method === 'POST' && $path === '/auth/session') {
        actionSession();
    }
    if ($method === 'GET' && $path === '/auth/me') {
        actionMe();
    }
    if ($method === 'POST' && $path === '/reviews') {
        actionReview();
    }
    if ($method === 'POST' && $path === '/orders') {
        actionCreateOrder();
    }
    if ($method === 'GET' && preg_match('#^/orders/([^/]+)$#', $path, $match)) {
        actionGetOrder($match[1]);
    }
    if ($method === 'GET' && $path === '/admin/stats') {
        actionAdminStats();
    }
    if ($method === 'GET' && $path === '/admin/products') {
        actionAdminProducts();
    }
    if ($method === 'POST' && $path === '/admin/products') {
        actionAdminCreateProduct();
    }
    if ($method === 'PUT' && preg_match('#^/admin/products/([^/]+)$#', $path, $match)) {
        actionAdminUpdateProduct($match[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/admin/products/([^/]+)$#', $path, $match)) {
        actionAdminDeleteProduct($match[1]);
    }
    if ($method === 'POST' && $path === '/admin/categories') {
        actionAdminCreateCategory();
    }
    if ($method === 'PUT' && preg_match('#^/admin/categories/([^/]+)$#', $path, $match)) {
        actionAdminUpdateCategory($match[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/admin/categories/([^/]+)$#', $path, $match)) {
        actionAdminDeleteCategory($match[1]);
    }
    if ($method === 'POST' && $path === '/admin/ingredients') {
        actionAdminCreateIngredient();
    }
    if ($method === 'PUT' && preg_match('#^/admin/ingredients/([^/]+)$#', $path, $match)) {
        actionAdminUpdateIngredient($match[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/admin/ingredients/([^/]+)$#', $path, $match)) {
        actionAdminDeleteIngredient($match[1]);
    }
    if ($method === 'GET' && $path === '/admin/orders') {
        actionAdminOrders();
    }
    if ($method === 'PATCH' && preg_match('#^/admin/orders/([^/]+)$#', $path, $match)) {
        actionAdminUpdateOrder($match[1]);
    }
    if ($method === 'GET' && $path === '/admin/customers') {
        actionAdminCustomers();
    }
    if ($method === 'PATCH' && preg_match('#^/admin/customers/([^/]+)$#', $path, $match)) {
        actionAdminUpdateCustomer($match[1]);
    }
    if ($method === 'GET' && $path === '/admin/reviews') {
        actionAdminReviews();
    }
    if ($method === 'DELETE' && preg_match('#^/admin/reviews/([^/]+)$#', $path, $match)) {
        actionAdminDeleteReview($match[1]);
    }
    if ($method === 'GET' && $path === '/admin/messages') {
        actionAdminMessages();
    }

    fail('Not found.', 404);
}
