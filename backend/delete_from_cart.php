<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once 'connection.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id    = $data['user_id'] ?? null;
$product_id = $data['product_id'] ?? null;

if (!$user_id || !$product_id) {
    echo json_encode(["success" => false, "message" => "Missing user or product ID"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM cart_items WHERE product_id = ? AND user_id = ?");
    $stmt->execute([$product_id, $user_id]);
    $msg = "Item removed from cart";

    echo json_encode(["success" => true, "message" => $message]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>