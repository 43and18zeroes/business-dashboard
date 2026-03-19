<?php

/* ==========================
config.php
========================== */

function loadEnv(string $path): array {
    $config = [];
    if (!file_exists($path)) return $config;

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if (str_starts_with($line, '#')) continue;
        if (!str_contains($line, '=')) continue;

        [$key, $value] = explode('=', $line, 2);
        $config[trim($key)] = trim($value);
    }

    return $config;
}

$env = loadEnv(__DIR__ . '/../.env');

define('DB_HOST', $env['DB_HOST'] ?? '');
define('DB_NAME', $env['DB_NAME'] ?? '');
define('DB_USER', $env['DB_USER'] ?? '');
define('DB_PASS', $env['DB_PASS'] ?? '');