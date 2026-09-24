<?php

class ApiException extends RuntimeException
{
    public function __construct(string $message, public int $status = 400)
    {
        parent::__construct($message);
    }
}

function jsonOut($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(normalizeJson($data), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $message, int $status): void
{
    throw new ApiException($message, $status);
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail('Check the form and try again.', 400);
    }
    return $data;
}

function requestPath(): string
{
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $uri = rawurldecode($uri);
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
    if ($scriptDir !== '/' && $scriptDir !== '.' && str_starts_with($uri, $scriptDir)) {
        $uri = substr($uri, strlen($scriptDir));
    }
    $uri = '/' . trim($uri, '/');
    if (str_starts_with($uri, '/api/')) {
        $uri = substr($uri, 4);
    } elseif ($uri === '/api') {
        $uri = '/';
    }
    return $uri === '/' ? '/' : rtrim($uri, '/');
}

function clientIp(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? 'local';
}

function bearerToken(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if ($header === '' && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                $header = $value;
                break;
            }
        }
    }
    if (!preg_match('/^Bearer\s+(\S+)/i', $header, $match)) {
        return null;
    }
    return $match[1];
}

function iso(?DateTimeInterface $when = null): string
{
    $utc = DateTimeImmutable::createFromInterface($when ?? new DateTimeImmutable('now'))
        ->setTimezone(new DateTimeZone('UTC'));
    return $utc->format('Y-m-d\TH:i:s.v\Z');
}

function uuid(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
}

function normalizeJson($value)
{
    if ($value instanceof stdClass) {
        return $value;
    }
    if (!is_array($value)) {
        return $value;
    }
    $isList = array_is_list($value);
    $out = [];
    foreach ($value as $key => $item) {
        if ($key === 'defaults') {
            $out[$key] = (object) (is_array($item) ? $item : []);
            continue;
        }
        $out[$key] = normalizeJson($item);
    }
    return $isList ? array_values($out) : $out;
}
