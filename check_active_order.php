<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once 'connection.php';

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_token'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "missing_token"]);
    exit;
}

try {
    // Matching your ENUM values exactly: PENDING, PAID, ASSIGNED, IN_TRANSIT are "Active"
    // We exclude 'COLLECTED' and 'CANCELLED'
    $stmt = $pdo->prepare("
        SELECT order_id 
        FROM orders 
        WHERE user_id = ? 
        AND order_status NOT IN ('COLLECTED', 'CANCELLED') 
        LIMIT 1
    ");
    $stmt->execute([$user_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode([
            "success" => true,
            "hasActiveOrder" => true,
            "order_id" => $result['order_id'],
            "message" => "active_order_found"
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "hasActiveOrder" => false,
            "message" => "no_active_order"
        ]);
    }
} catch (PDOException $e) {
    // For debugging, you can use: "message" => $e->getMessage()
    echo json_encode(["success" => false, "message" => "server_error"]);
}
exit;