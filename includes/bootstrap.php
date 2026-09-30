<?php

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

require_once __DIR__ . '/../config/database.php';

const DELIVERY_FEE = 3.50;
const TAX_RATE = 0.08;

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function money(float $value): string
{
    return '€' . number_format($value, 2, ',', '');
}

function menu_categories(): array
{
    try {
        return db()->query('SELECT id, name, slug, image FROM categories ORDER BY id')->fetchAll();
    } catch (Throwable $error) {
        return [];
    }
}

function round_money(float $value): float
{
    return round($value, 2);
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function check_csrf(): void
{
    $sent = $_POST['csrf'] ?? '';
    if (!is_string($sent) || !hash_equals(csrf_token(), $sent)) {
        http_response_code(400);
        exit('Invalid request.');
    }
}

function flash(string $message): void
{
    $_SESSION['flash'] = $message;
}

function take_flash(): string
{
    $message = $_SESSION['flash'] ?? '';
    unset($_SESSION['flash']);
    return $message;
}

function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    $stmt = db()->prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    return $user ?: null;
}

function require_login(): array
{
    $user = current_user();
    if (!$user) {
        header('Location: /login.php');
        exit;
    }
    return $user;
}

function require_admin(): array
{
    $user = require_login();
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        exit('Admin access only.');
    }
    return $user;
}

function cart(): array
{
    return $_SESSION['cart'] ?? [];
}

function cart_count(): int
{
    $count = 0;
    foreach (cart() as $line) {
        $count += (int) $line['quantity'];
    }
    return $count;
}

function cart_totals(): array
{
    $subtotal = 0.0;
    foreach (cart() as $line) {
        $subtotal += (float) $line['unit_price'] * (int) $line['quantity'];
    }
    $subtotal = round_money($subtotal);
    $code = strtoupper(trim($_SESSION['discount_code'] ?? ''));
    $discount = $code === 'STOP10' ? round_money($subtotal * 0.1) : 0.0;
    $tax = round_money(($subtotal - $discount) * TAX_RATE);
    $total = round_money($subtotal - $discount + DELIVERY_FEE + $tax);
    return compact('subtotal', 'discount', 'code', 'tax', 'total') + ['delivery' => DELIVERY_FEE];
}

function redirect(string $path): void
{
    header('Location: ' . $path);
    exit;
}

function active(string $path): string
{
    $current = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    return $current === $path ? 'active' : '';
}
