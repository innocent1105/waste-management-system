<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: *");


require_once 'connection.php';
$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_token'] ?? null;


try {
    $stmt = $pdo->prepare("SELECT * FROM user_location WHERE user_id = ? LIMIT 1");
    $stmt->execute([$user_id]);
    $truck = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($truck) {
        echo json_encode([
            "success" => true,
            "lat" => (float)$truck['latitude'],
            "lng" => (float)$truck['longitude'],
            "last_update" => $truck['updated_at']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Truck not found"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}