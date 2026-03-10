<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'connection.php';
include "send_email.php";

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;
$status = $data['status'] ?? null;

if (!$id || !$status) {
    echo json_encode(["success" => false, "message" => "Missing data"]);
    exit;
}

try {
    // Fetch info for the email
    $stmt = $pdo->prepare("
        SELECT u.full_name, u.email 
        FROM orders o 
        JOIN users u ON o.user_id = u.user_id 
        WHERE o.id = ?
    ");
    $stmt->execute([$id]);
    $orderData = $stmt->fetch();

    if ($orderData) {
        $receiversAddress = $orderData['email'];
        $full_name = $orderData['full_name'];
        $ref = "";
        $app_name = "Waste Management System";

        // Logic for Email content
        $status_note = "Your collection request #$ref status has been updated to $status.";
        $title = "Update on Request #$ref";

        // Basic Text Email (Modify as per your HTML template)
        $message = "Hi $full_name, $status_note";

        send_email($receiversAddress, $full_name, $message, $title, $app_name);
    }

    $update = $pdo->prepare("UPDATE orders SET order_status = ? WHERE id = ?");
    $success = $update->execute([$status, $id]);

    echo json_encode(["success" => $success]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}