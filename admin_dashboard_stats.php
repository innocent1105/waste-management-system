<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'connection.php';

try {
    $wallet = $pdo->query("SELECT balance FROM system_wallet WHERE id = 1")->fetchColumn() ?: 0;
    $orders = $pdo->query("SELECT COUNT(*) FROM orders WHERE payment_status = 'PAID'")->fetchColumn();
    $customers = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();

    $prevOrders = $pdo->query("SELECT COUNT(*) FROM orders WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();
    $prevCustomers = $pdo->query("SELECT COUNT(*) FROM users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();
    
    $totalTrx = $pdo->query("SELECT COUNT(*) FROM transactions")->fetchColumn() ?: 1;
    $successTrx = $pdo->query("SELECT COUNT(*) FROM transactions WHERE payment_status = 'SUCCESS'")->fetchColumn();
    $conversion = round(($successTrx / $totalTrx) * 100, 1);

    $history = $pdo->query("
        SELECT DATE_FORMAT(created_at, '%D') as date, SUM(amount) as revenue 
        FROM transactions 
        WHERE payment_status = 'SUCCESS' 
        GROUP BY DATE(created_at) LIMIT 30
    ")->fetchAll(PDO::FETCH_ASSOC);

    $growth = $pdo->query("
        SELECT DATE_FORMAT(created_at, '%D') as date, COUNT(*) as count 
        FROM users 
        GROUP BY DATE(created_at) LIMIT 30
    ")->fetchAll(PDO::FETCH_ASSOC);

    $statusData = $pdo->query("
        SELECT payment_status as name, COUNT(*) as value 
        FROM transactions 
        GROUP BY payment_status
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "stats" => [
            "revenue" => (float)$wallet,
            "prevRevenue" => (float)$wallet * 0.94, 
            "orders" => (int)$orders,
            "prevOrders" => (int)$prevOrders,
            "customers" => (int)$customers,
            "prevCustomers" => (int)$prevCustomers,
            "conversion" => $conversion
        ],
        "revenueHistory" => $history,
        "customerGrowth" => $growth,
        "statusDistribution" => $statusData
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}