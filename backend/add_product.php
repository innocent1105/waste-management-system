<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'connection.php';

$upload_dir = "uploads/products/";
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$name = $_POST['name'];
$category_id = $_POST['category_id'];
$price = $_POST['price'];
$stock_quantity = $_POST['stock'];
$description = $_POST['description'];
$in_stock = $_POST['in_stock'];

$uploaded_images = [];

if (!empty($_FILES['product_images'])) {
    foreach ($_FILES['product_images']['tmp_name'] as $key => $tmp_name) {
        $file_name = time() . "_" . $_FILES['product_images']['name'][$key];
        $target_file = $upload_dir . $file_name;

        if (move_uploaded_file($tmp_name, $target_file)) {
            $uploaded_images[] = $file_name;
        }
    }
}

// Logic for your database requirements
$primary_img = !empty($uploaded_images) ? $uploaded_images[0] : null;
$images_json = json_encode($uploaded_images);

try {
    $sql = "INSERT INTO products (category_id, name, description, price, stock_quantity, img, images, in_stock) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$category_id, $name, $description, $price, $stock_quantity, $primary_img, $images_json, $in_stock]);

    echo json_encode(["success" => true, "message" => "Product added"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}