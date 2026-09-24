<?php

$configFile = dirname(__DIR__) . '/config.php';
if (!is_file($configFile)) {
    $configFile = dirname(__DIR__) . '/config.example.php';
}
$config = require $configFile;

date_default_timezone_set($config['timezone'] ?? 'America/Los_Angeles');

require __DIR__ . '/Http.php';
require __DIR__ . '/Options.php';
require __DIR__ . '/Auth.php';
require __DIR__ . '/Validate.php';
require __DIR__ . '/Pricing.php';
require __DIR__ . '/Store.php';
require __DIR__ . '/Actions.php';

register_shutdown_function('storeClose');
