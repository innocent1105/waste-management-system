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

$stmt = $pdo->prepare("
    SELECT o.transaction_reference, u.full_name, u.email 
    FROM orders o 
    JOIN users u ON o.user_id = u.user_id 
    WHERE o.id = ?
");
$stmt->execute([$id]);
$orderData = $stmt->fetch();

if (!$orderData) {
    echo json_encode(["success" => false, "message" => "Order or User not found"]);
    exit;
}

$transaction_reference = $orderData['transaction_reference'];
$receiversAddress = $orderData['email'];
$full_name = $orderData['full_name'];
$app_name = "Pascom Innovations.";

$status_color = "#121212";
$status_note = "The status of your order has been updated.";
$title = "Order Update: #$transaction_reference";

switch ($status) {
    case 'PAID':
        $status_color = "#15803d";
        $title = "Payment Confirmed! Order";
        $status_note = "We've received your payment. Our team is now preparing your items for packaging.";
        break;
    case 'PROCESSING':
        $status_color = "#ca8a04";
        $title = "Processing Order";
        $status_note = "Your order is currently being processed and will be ready for shipment soon.";
        break;
    case 'SHIPPED':
        $status_color = "#1d4ed8";
        $title = "Your Order is on the Way!";
        $status_note = "Great news! Your order has been shipped and is currently in transit to your address.";
        break;
    case 'DELIVERED':
        $status_color = "#15803d";
        $title = "Order Delivered!";
        $status_note = "Your order has been successfully delivered. We hope you enjoy your purchase!";
        break;
    case 'CANCELLED':
        $status_color = "#dc2626";
        $title = "Order Cancelled: ";
        $status_note = "Your order has been cancelled. If you have any questions, please contact our support.";
        break;
}

$message = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #121212; border-radius: 8px; overflow: hidden; margin-top: 40px; }
        .header { background-color: #121212; padding: 40px; text-align: center; }
        .content { padding: 40px; text-align: center; line-height: 1.6; }
        .status-badge { 
            font-size: 16px; 
            font-weight: bold; 
            background: #ffffff; 
            padding: 10px 25px; 
            border-radius: 50px; 
            border: 2px solid $status_color; 
            color: $status_color;
            display: inline-block; 
            margin: 20px 0; 
            text-transform: uppercase;
        }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; }
        h1 { font-size: 24px; margin: 0; color: #ffffff; }
        .button { background-color: #121212; color: #ffffff !important; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; font-weight: bold; }
    </style>
</head>
<body>
    <center class='wrapper'>
        <table class='main'>
            <tr><td class='header'><h1>$app_name</h1></td></tr>
            <tr>
                <td class='content'>
                    <h2 style='margin-top:0;'>Hi $full_name,</h2>
                    <p>$status_note</p>
                    <div class='status-badge'>$status</div>
                    <p style='color:#888; font-size: 13px;'>Order Reference: #$transaction_reference</p>
                    <a href='https://yourshop.com/account/orders' class='button'>Track My Order</a>
                </td>
            </tr>
            <tr>
                <td class='footer'>
                    &copy;" . date("Y") . " $app_name. Lusaka, Zambia.
                </td>
            </tr>
        </table>
    </center>
</body>
</html>";

send_email($receiversAddress, $full_name, $message, $title, $app_name);

$stmt = $pdo->prepare("UPDATE orders SET order_status = ? WHERE id = ?");
$success = $stmt->execute([$status, $id]);

echo json_encode(["success" => $success, "message" => "Status updated and email sent"]);