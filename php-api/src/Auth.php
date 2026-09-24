<?php

function jwtSecret(): string
{
    global $config;
    $secret = $config['jwt_secret'] ?? '';
    return $secret !== '' ? $secret : 'dev-stopandgo-secret';
}

function b64url(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function signUser(array $user): string
{
    $header = b64url(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = b64url(json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'name' => $user['name'],
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60),
    ]));
    $signature = b64url(hash_hmac('sha256', $header . '.' . $payload, jwtSecret(), true));
    return $header . '.' . $payload . '.' . $signature;
}

function verifyUser(?string $token): array
{
    if (!$token || substr_count($token, '.') !== 2) {
        fail('Session expired. Sign in again.', 401);
    }
    [$header, $payload, $signature] = explode('.', $token);
    $expected = b64url(hash_hmac('sha256', $header . '.' . $payload, jwtSecret(), true));
    if (!hash_equals($expected, $signature)) {
        fail('Session expired. Sign in again.', 401);
    }
    $json = base64_decode(strtr($payload, '-_', '+/'));
    $data = json_decode($json ?: '', true);
    if (!is_array($data) || (($data['exp'] ?? 0) < time())) {
        fail('Session expired. Sign in again.', 401);
    }
    return $data;
}

function requireUser(): array
{
    if (!bearerToken()) {
        fail('Sign in required.', 401);
    }
    return verifyUser(bearerToken());
}

function optionalUser(): ?array
{
    $token = bearerToken();
    if (!$token) {
        return null;
    }
    return verifyUser($token);
}

function requireAdmin(): array
{
    $user = requireUser();
    if (($user['role'] ?? '') !== 'admin') {
        fail('Admin access only.', 403);
    }
    return $user;
}

function rateLimit(string $key, int $max, int $windowSeconds): void
{
    $file = dirname(__DIR__) . '/data/rate-limit.json';
    $handle = fopen($file, 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) {
        fail('Too many attempts. Wait a moment and try again.', 429);
    }
    $raw = stream_get_contents($handle);
    $all = json_decode($raw ?: '', true);
    if (!is_array($all)) {
        $all = [];
    }
    $now = time();
    $id = $key . ':' . clientIp();
    $bucket = array_values(array_filter($all[$id] ?? [], fn($time) => $now - (int) $time < $windowSeconds));
    if (count($bucket) >= $max) {
        flock($handle, LOCK_UN);
        fclose($handle);
        fail('Too many attempts. Wait a moment and try again.', 429);
    }
    $bucket[] = $now;
    $all[$id] = $bucket;
    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, json_encode($all));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}
