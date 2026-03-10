<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

require_once 'connection.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_token'] ?? null;

if (!$user_id) {
    echo json_encode([
        "success" => false,
        "message" => "User identifier missing"
    ]);
    exit;
}

try {

    $stmt = $pdo->prepare("
        SELECT *
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");

    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $finalOrders = [];

    foreach ($orders as $order) {

        $publicOrderId = $order['order_id'];
        $userId = $order['user_id'];

        // Fetch customer name
        $userStmt = $pdo->prepare("
            SELECT full_name
            FROM users
            WHERE user_id = ?
        ");

        $userStmt->execute([$userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        // Fetch transaction reference
        $txStmt = $pdo->prepare("
            SELECT transaction_reference
            FROM transactions
            WHERE order_id = ?
            LIMIT 1
        ");

        $txStmt->execute([$publicOrderId]);
        $tx = $txStmt->fetch(PDO::FETCH_ASSOC);

        $finalOrders[] = [
            "order_id" => $publicOrderId,
            "transaction_reference" => $tx['transaction_reference'] ?? null,
            "customer_name" => $user ? $user['full_name'] : "Unknown",
            "total_amount" => (float)$order['total_amount'],
            "order_status" => $order['order_status'],
            "payment_status" => $order['payment_status'],
            "pickup_address" => $order['pickup_address'],
            "date" => $order['created_at']
        ];
    }

    echo json_encode([
        "success" => true,
        "orders" => $finalOrders
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "Server Error"
    ]);
}