<?php

require_once 'config.php';

$allowedOrigins = [
    'http://localhost:4200',
    'https://business-dashboard.cw-coding.de',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!DB_HOST || !DB_NAME || !DB_USER) {
    http_response_code(500);
    echo json_encode(['error' => 'Server-Konfigurationsfehler']);
    exit;
}

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    $sales = $pdo->query('
        SELECT category, sales, costs
        FROM sales_stats
    ')->fetchAll();

    $newCustomers = $pdo->query('
        SELECT category, current_year AS currentYear, last_year AS lastYear
        FROM customer_stats
    ')->fetchAll();

    $newCustomers = array_map(function (array $row): array {
        return [
            'category'    => $row['category'],
            'currentYear' => (int) $row['currentYear'],
            'lastYear'    => (int) $row['lastYear'],
        ];
    }, $newCustomers);

    $sales = array_map(function (array $row): array {
        return [
            'category' => $row['category'],
            'sales'    => (int) $row['sales'],
            'costs'    => (int) $row['costs'],
        ];
    }, $sales);

    $projects = $pdo->query('
        SELECT overall, completed
        FROM projects
        LIMIT 1
    ')->fetchAll();

    $projects = array_map(function (array $row): array {
        return [
            'overall'   => (int) $row['overall'],
            'completed' => (int) $row['completed'],
        ];
    }, $projects);

    $transactions = $pdo->query('
        SELECT tx_id AS txId, user, date, cost
        FROM transactions
        ORDER BY date DESC
    ')->fetchAll();

    $transactions = array_map(function (array $row): array {
        return [
            'txId' => $row['txId'],
            'user' => $row['user'],
            'date' => $row['date'],
            'cost' => (float) $row['cost'],
        ];
    }, $transactions);

    echo json_encode([
        'sales'        => $sales,
        'newCustomers' => $newCustomers,
        'projects'     => $projects,
        'transactions' => $transactions,
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    error_log('[dashboard.php] DB-Fehler: ' . $e->getMessage());
    echo json_encode(['error' => 'Datenbankfehler']);
}