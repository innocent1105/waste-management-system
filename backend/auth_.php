<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once 'connection.php';

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_token'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "missing_token"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT email, role FROM users WHERE user_id = ? LIMIT 1");
    $stmt->execute([$user_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode([
            "success" => true,
            "message" => "auth",
            "email" => $result['email'],
            "role" => $result['role']
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "un_auth"
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "server_error"]);
}
exit;























