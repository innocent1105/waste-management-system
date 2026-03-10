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
    // 1. Fetch the main order and user details
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

    

    echo json_encode($order);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}