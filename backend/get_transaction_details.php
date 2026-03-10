<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit;

require_once 'connection.php';

$data = json_decode(file_get_contents("php://input"), true);
$trx_id = $data['transaction_id'] ?? null;

if (!$trx_id) {
    echo json_encode(["success" => false, "message" => "No ID provided"]);
    exit;
}

try {
    // Fetch Transaction + Order + Customer + Driver Info
    $stmt = $pdo->prepare("
        SELECT 
            t.transaction_reference as ref,
            t.payment_method,
            t.amount,
            t.status,
            t.created_at as date,
            o.order_id,
            o.pickup_address,
            o.order_status,
            o.scheduled_for,
            u.full_name as customer_name,
            u.email as customer_email,
            u.phone as customer_phone,
            d.full_name as driver_name,
            d.phone as driver_phone
        FROM transactions t
        JOIN orders o ON t.order_id = o.order_id
        JOIN users u ON o.user_id = u.user_id
        LEFT JOIN users d ON o.driver_id = d.user_id
        WHERE t.transaction_reference = ?
    ");
    $stmt->execute([$trx_id]);
    $details = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$details) throw new Exception("Transaction not found");

    echo json_encode([
        "success" => true,
        "details" => $details
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}