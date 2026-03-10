<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'connection.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'] ?? null;
$lat = $data['latitude'] ?? null;
$lng = $data['longitude'] ?? null;

if (!$user_id || !$lat || !$lng) {
    echo json_encode(["success" => false, "message" => "Incomplete data"]);
    exit;
}

try {
    /* To prevent creating thousands of rows for the same user, 
       we check if the user already has a location row.
    */
    $checkStmt = $pdo->prepare("SELECT id FROM user_location WHERE user_id = ?");
    $checkStmt->execute([$user_id]);
    $exists = $checkStmt->fetch();

    if ($exists) {
        // Update existing location
        $stmt = $pdo->prepare("
            UPDATE user_location 
            SET latitude = ?, longitude = ?, updated_at = NOW() 
            WHERE user_id = ?
        ");
        $stmt->execute([$lat, $lng, $user_id]);
    } else {
        // Create new location entry
        $stmt = $pdo->prepare("
            INSERT INTO user_location (user_id, latitude, longitude) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$user_id, $lat, $lng]);
    }

    echo json_encode(["success" => true, "message" => "Location synced"]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}