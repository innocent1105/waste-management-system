<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

require_once 'connection.php';

try {
    $stmt = $pdo->query("SELECT id, user_id, transaction_reference, total_amount, order_status, created_at FROM orders WHERE order_status != 'pending' ORDER BY created_at DESC");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $finalOrders = [];

    foreach ($orders as $order) {
        $orderInternalId = $order['id'];
        $userId = $order['user_id']; 

        $userStmt = $pdo->prepare("SELECT full_name FROM users WHERE user_id = ?");
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        $itemStmt = $pdo->prepare("SELECT COUNT(*) as total_items FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$orderInternalId]);
        $itemCount = $itemStmt->fetch(PDO::FETCH_ASSOC);

        $finalOrders[] = [
            "id" => $orderInternalId,
            "order_number" => $order['transaction_reference'],
            "customer_name" => $user ? $user['full_name'] : "Guest User",
            "total_amount" => (float)$order['total_amount'],
            "status" => ucfirst(strtolower($order['order_status'])), // 'Pending', 'Paid'
            "date" => $order['created_at'],
            "item_count" => (int)($itemCount['total_items'] ?? 0)
        ];
    }

    echo json_encode($finalOrders);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}