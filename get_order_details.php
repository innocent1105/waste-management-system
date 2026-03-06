<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'connection.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(["error" => "No ID provided"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT o.*, u.full_name, u.email, u.phone 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.user_id 
        WHERE o.id = ?
    ");
    $stmt->execute([$id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        echo json_encode(null);
        exit;
    }

    $itemStmt = $pdo->prepare("
        SELECT oi.*, p.name, p.img 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
    ");
    $itemStmt->execute([$id]);
    $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($order);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}