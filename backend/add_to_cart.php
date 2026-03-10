<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once 'connection.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id    = $data['user_id'] ?? null;
$product_id = $data['product_id'] ?? null;
$quantity   = $data['quantity'] ?? 1;

if (!$user_id || !$product_id) {
    echo json_encode(["success" => false, "message" => "Missing user or product ID"]);
    exit;
}

try {
    $check = $pdo->prepare("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?");
    $check->execute([$user_id, $product_id]);
    $existingItem = $check->fetch();

    if ($existingItem) {
        $newQty = $existingItem['quantity'] + ($quantity);

        if ($newQty <= 0) {
            $stmt = $pdo->prepare("DELETE FROM cart_items WHERE product_id = ? AND user_id = ?");
            $stmt->execute([$product_id, $user_id]);
            $msg = "Item removed from cart";
        } else {
            $stmt = $pdo->prepare("UPDATE cart_items SET quantity = ? WHERE product_id = ? AND user_id = ?");
            $stmt->execute([$newQty, $product_id, $user_id]);
            $msg = "Quantity updated";
        }
    } else {
        $insert = $pdo->prepare("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $insert->execute([$user_id, $product_id, $quantity]);
        $message = "Added to cart";
    }

    echo json_encode(["success" => true, "message" => $message]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>