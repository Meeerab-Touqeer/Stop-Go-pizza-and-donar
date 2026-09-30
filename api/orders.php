<?php
require __DIR__ . '/../includes/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');
$user = current_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Sign in required.']);
    exit;
}
$stmt = db()->prepare('SELECT id, status, total, payment_method, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC');
$stmt->execute([$user['id']]);
echo json_encode(['orders' => $stmt->fetchAll()]);
