<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
require_once 'connection.php';

if (!isset($_GET['id'])) {
    echo json_encode(["error" => "Product ID is missing"]);
    exit;
}

$id = $_GET['id'];
$user_id = $_GET['user_id'];
$base_url = "";



try {
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($product) {
        $product['img'] = $base_url . $product['img'];

        $decoded_images = json_decode($product['images'], true);
        
        if (is_array($decoded_images)) {
            $product['gallery'] = array_map(function($imgName) use ($base_url) {
                return $base_url . $imgName;
            }, $decoded_images);
        } else {
            $product['gallery'] = [$product['img']];
        }

error_log("Checking Cart - UID: " . $user_id . " PID: " . $id);

$stmt = $pdo->prepare("SELECT COUNT(*) FROM cart_items WHERE user_id = ? AND product_id = ?");
$stmt->execute([(string)$user_id, (int)$id]);
$count = $stmt->fetchColumn();

$product['in_cart'] = ($count > 0);

        echo json_encode($product);
    } else {
        echo json_encode(["error" => "Product not found"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}