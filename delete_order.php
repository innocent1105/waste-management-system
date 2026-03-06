<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'connection.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;

if ($id) {
    $pdo->beginTransaction();
    try {
        // Delete items first (Foreign Key safety)
        $stmt1 = $pdo->prepare("DELETE FROM order_items WHERE order_id = ?");
        $stmt1->execute([$id]);

        // Delete order
        $stmt2 = $pdo->prepare("DELETE FROM orders WHERE id = ?");
        $stmt2->execute([$id]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false]);
    }
}