<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'connection.php';
include "send_email.php";

$data = json_decode(file_get_contents("php://input"), true);

$user_id      = $data['user_token'] ?? null;
$reference_id = $data['reference_id'] ?? null;
$order_id     = $data['order_id'] ?? null;

$auth_key = "01KHX5G65YRTA5TQNZM3YCP1FY";

if (!$user_id || !$reference_id || !$order_id) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required parameters"
    ]);
    exit;
}

try {

    $curl = curl_init();

    curl_setopt_array($curl, [
        CURLOPT_URL => 'https://api.moneyunify.one/payments/verify',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            "auth_id" => $auth_key,
            "transaction_id" => $reference_id
        ]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded']
    ]);

    $response = curl_exec($curl);
    curl_close($curl);

    $resArr = json_decode($response, true);

    $apiStatus = strtolower($resArr['data']['status'] ?? 'pending');

    if ($apiStatus === 'successful' || $apiStatus === 'success') {

        $pdo->beginTransaction();

        $check = $pdo->prepare("
            SELECT status, amount 
            FROM transactions 
            WHERE transaction_reference = ? 
            AND order_id = ?
            FOR UPDATE
        ");

        $check->execute([$reference_id, $order_id]);
        $tx_data = $check->fetch(PDO::FETCH_ASSOC);

        if (!$tx_data) {
            throw new Exception("Transaction not found.");
        }

        if ($tx_data['status'] === 'SUCCESS') {

            $pdo->rollBack();

            echo json_encode([
                "success" => true,
                "status" => "successful",
                "message" => "Already processed"
            ]);

            exit;
        }

        $amount = $tx_data['amount'];

        $pdo->prepare("
            UPDATE transactions
            SET status='SUCCESS',
                paid_at = NOW(),
                external_response = ?
            WHERE transaction_reference = ?
        ")->execute([
            json_encode($resArr),
            $reference_id
        ]);

        $pdo->prepare("
            UPDATE orders
            SET order_status='PAID',
                payment_status='PAID'
            WHERE order_id=?
        ")->execute([$order_id]);

        $pdo->prepare("
            UPDATE system_wallet
            SET balance = balance + ?
            WHERE id = 1
        ")->execute([$amount]);

        $u_stmt = $pdo->prepare("
            SELECT email, full_name
            FROM users
            WHERE user_id = ?
        ");

        $u_stmt->execute([$user_id]);
        $user = $u_stmt->fetch(PDO::FETCH_ASSOC);

        $message = "Your payment for order $order_id was successful.";

        $pdo->prepare("
            INSERT INTO notifications
            (user_id, title, message, is_read)
            VALUES (?, 'Payment Received', ?, 0)
        ")->execute([$user_id, $message]);

        $pdo->commit();

        if ($user) {

            $email_body = "
            <h2>Payment Successful</h2>
            <p>Hello {$user['full_name']},</p>
            <p>Your payment of <b>K" . number_format($amount,2) . "</b> for order <b>$order_id</b> has been confirmed.</p>
            ";

            @send_email(
                $user['email'],
                $user['full_name'],
                $email_body,
                "Payment Confirmed",
                "Waste Management Services"
            );
        }

        echo json_encode([
            "success" => true,
            "status" => "successful",
            "message" => "Transaction completed"
        ]);

    }

    else if ($apiStatus === 'failed') {

        $pdo->beginTransaction();

        $pdo->prepare("
            UPDATE transactions
            SET status='FAILED',
                external_response = ?
            WHERE transaction_reference=?
        ")->execute([
            json_encode($resArr),
            $reference_id
        ]);

        $pdo->prepare("
            UPDATE orders
            SET order_status='CANCELLED',
                payment_status='FAILED'
            WHERE order_id=?
        ")->execute([$order_id]);

        $pdo->commit();

        echo json_encode([
            "success" => true,
            "status" => "failed"
        ]);
    }

    else {

        echo json_encode([
            "success" => true,
            "status" => "pending"
        ]);
    }

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