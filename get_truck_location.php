<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

require_once 'connection.php';

try {
    // Fetch specifically the truck (ID 1)
    $stmt = $pdo->prepare("SELECT latitude, longitude, updated_at FROM user_location WHERE id = 1 LIMIT 1");
    $stmt->execute();
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