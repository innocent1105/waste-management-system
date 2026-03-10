<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'connection.php';

try {
    // 1. Get System Balance
    $wallet = $pdo->query("SELECT balance FROM system_wallet LIMIT 1")->fetchColumn() ?: 0.00;

    // 2. Count Total Orders and Previous Month Orders (for % change)
    $orders = $pdo->query("SELECT COUNT(*) FROM orders WHERE order_status != 'CANCELLED'")->fetchColumn();
    $prevOrders = $pdo->query("SELECT COUNT(*) FROM orders WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();

    // 3. Count Customers vs Drivers
    $customers = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'BUYER'")->fetchColumn();
    $prevCustomers = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'BUYER' AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();
    $drivers = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'DRIVER'")->fetchColumn();

    // 4. Payment Health (Success Rate)
    $totalTrx = $pdo->query("SELECT COUNT(*) FROM transactions")->fetchColumn() ?: 1;
    $successTrx = $pdo->query("SELECT COUNT(*) FROM transactions WHERE status = 'SUCCESS'")->fetchColumn();
    $conversion = round(($successTrx / $totalTrx) * 100, 1);

    // 5. Revenue History (Last 30 Days) - Mapping to Transaction Status
    $history = $pdo->query("
        SELECT DATE_FORMAT(created_at, '%b %d') as date, SUM(amount) as revenue 
        FROM transactions 
        WHERE status = 'SUCCESS' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY created_at ASC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // 6. Customer Growth
    $growth = $pdo->query("
        SELECT DATE_FORMAT(created_at, '%b %d') as date, COUNT(*) as count 
        FROM users 
        WHERE role = 'BUYER'
        GROUP BY DATE(created_at)
        ORDER BY created_at ASC
        LIMIT 30
    ")->fetchAll(PDO::FETCH_ASSOC);

    // 7. Transaction Distribution (Pie Chart)
    $statusData = $pdo->query("
        SELECT status as name, COUNT(*) as value 
        FROM transactions 
        GROUP BY status
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "stats" => [
            "revenue" => (float)$wallet,
            "prevRevenue" => (float)$wallet * 0.90, // Placeholder or fetch from a log table
            "orders" => (int)$orders,
            "prevOrders" => (int)$prevOrders,
            "customers" => (int)$customers,
            "prevCustomers" => (int)$prevCustomers,
            "drivers" => (int)$drivers,
            "conversion" => $conversion
        ],
        "revenueHistory" => $history,
        "customerGrowth" => $growth,
        "statusDistribution" => $statusData
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}