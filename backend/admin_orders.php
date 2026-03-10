<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

require_once 'connection.php';

try {
    // We join with users to get the name and filter by your specific schema columns
    $query = "
        SELECT 
            o.id, 
            o.order_id as order_number, 
            o.total_amount, 
            o.order_status as status, 
            o.created_at as date,
            o.pickup_address,
            u.full_name as customer_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        ORDER BY o.created_at DESC
    ";

    $stmt = $pdo->query($query);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Note: Since waste management usually involves requests rather than a shopping cart of 
    // many products, 'item_count' here represents '1 Collection Request' unless you add an order_items table.
    $finalOrders = array_map(function($order) {
        return [
            "id" => $order['id'],
            "order_number" => $order['order_number'],
            "customer_name" => $order['customer_name'] ?: "Unknown User",
            "total_amount" => (float)$order['total_amount'],
            "status" => $order['status'], // Matches: PENDING, PAID, ASSIGNED, IN_TRANSIT, COLLECTED, CANCELLED
            "date" => $order['date'],
            "address" => $order['pickup_address'],
            "item_count" => 1 
        ];
    }, $orders);

    echo json_encode($finalOrders);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}