<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once 'connection.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_token'] ?? null;
$phone_number = $data['phone_number'] ?? null;
$amount = $data['amount'] ?? 150;

$auth_key = "01KHX5G65YRTA5TQNZM3YCP1FY";

if (!$user_id) {

    echo json_encode([
        "success" => false,
        "message" => "User identifier missing"
    ]);

    exit;
}

if (empty($phone_number) || strlen($phone_number) < 10) {

    echo json_encode([
        "success" => false,
        "message" => "Valid phone number required"
    ]);

    exit;
}

try {

    $addr_stmt = $pdo->prepare("
        SELECT u.email,
               a.address_line,
               a.latitude,
               a.longitude
        FROM users u
        LEFT JOIN user_addresses a
        ON u.user_id = a.user_id
        AND a.is_default = 1
        WHERE u.user_id = ?
    ");

    $addr_stmt->execute([$user_id]);

    $user_info = $addr_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user_info) {
        throw new Exception("User account not found.");
    }

    if (!$user_info['latitude'] || !$user_info['longitude']) {

        echo json_encode([
            "success" => false,
            "address_required" => true,
            "message" => "Please pin your location first."
        ]);

        exit;
    }

    $address = $user_info['address_line'] ?? "No address text";

    $lat = $user_info['latitude'];
    $lng = $user_info['longitude'];

    $pdo->beginTransaction();

    $curl = curl_init();

    curl_setopt_array($curl, [
        CURLOPT_URL => 'https://api.moneyunify.one/payments/request',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            "from_payer" => $phone_number,
            "amount" => $amount,
            "auth_id" => $auth_key
        ]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded']
    ]);

    $api_response = curl_exec($curl);
    curl_close($curl);

    $resArr = json_decode($api_response, true);

    if (!isset($resArr['data']['transaction_id'])) {
        throw new Exception($resArr['message'] ?? "Payment provider error");
    }

    $tx_ref = $resArr['data']['transaction_id'];

    $order_id = "ORD-" . strtoupper(bin2hex(random_bytes(4)));

    $stmt = $pdo->prepare("
        INSERT INTO orders
        (
            order_id,
            user_id,
            total_amount,
            order_status,
            payment_status,
            pickup_address,
            pickup_latitude,
            pickup_longitude
        )
        VALUES
        (?, ?, ?, 'PENDING', 'UNPAID', ?, ?, ?)
    ");

    $stmt->execute([
        $order_id,
        $user_id,
        $amount,
        $address,
        $lat,
        $lng
    ]);

    $transaction = $pdo->prepare("
        INSERT INTO transactions
        (
            order_id,
            user_id,
            transaction_reference,
            amount,
            payment_method,
            status
        )
        VALUES
        (?, ?, ?, ?, 'MoMo', 'PENDING')
    ");

    $transaction->execute([
        $order_id,
        $user_id,
        $tx_ref,
        $amount
    ]);

    $msg = "Order $order_id placed. Check your phone for the MoMo PIN prompt.";

    $notif = $pdo->prepare("
        INSERT INTO notifications
        (user_id, title, message)
        VALUES (?, ?, ?)
    ");

    $notif->execute([
        $user_id,
        "Payment Initiated",
        $msg
    ]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "order_id" => $order_id,
        "transaction_reference" => $tx_ref,
        "message" => "Payment request sent to $phone_number"
    ]);
}

catch (Exception $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}