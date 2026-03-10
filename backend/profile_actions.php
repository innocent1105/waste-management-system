<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'connection.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User identifier missing"]);
    exit;
}

switch($method) {
    case 'GET':
        try {
            // JOIN users with their default address from user_addresses table
            $query = "SELECT u.full_name, u.email, u.phone, u.role, u.created_at, 
                             a.address_line, a.city, a.latitude, a.longitude 
                      FROM users u 
                      LEFT JOIN user_addresses a ON u.user_id = a.user_id AND a.is_default = 1
                      WHERE u.user_id = ?";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                echo json_encode(["success" => true, "data" => $user]);
            } else {
                echo json_encode(["success" => false, "message" => "User not found"]);
            }
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'POST': 
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['full_name'])) {
            echo json_encode(["success" => false, "message" => "Full name is required"]);
            exit;
        }

        try {
            $pdo->beginTransaction();

            // 1. Update basic user info
            $stmt1 = $pdo->prepare("UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?");
            $stmt1->execute([$data['full_name'], $data['phone'] ?? null, $user_id]);

            // 2. Handle Address (Check if address exists for this user)
            $checkAddr = $pdo->prepare("SELECT id FROM user_addresses WHERE user_id = ? LIMIT 1");
            $checkAddr->execute([$user_id]);
            $existingAddress = $checkAddr->fetch();

            if ($existingAddress) {
                // UPDATE existing address
                $stmt2 = $pdo->prepare("UPDATE user_addresses SET address_line = ?, city = ?, latitude = ?, longitude = ? WHERE user_id = ?");
                $stmt2->execute([
                    $data['address_line'] ?? '',
                    $data['city'] ?? null,
                    $data['latitude'] ?? null,
                    $data['longitude'] ?? null,
                    $user_id
                ]);
            } else {
                // INSERT new address as default
                $stmt2 = $pdo->prepare("INSERT INTO user_addresses (user_id, address_line, city, latitude, longitude, is_default) VALUES (?, ?, ?, ?, ?, 1)");
                $stmt2->execute([
                    $user_id,
                    $data['address_line'] ?? '',
                    $data['city'] ?? null,
                    $data['latitude'] ?? null,
                    $data['longitude'] ?? null
                ]);
            }

            $pdo->commit();
            echo json_encode(["success" => true, "message" => "Profile and Location updated"]);

        } catch (PDOException $e) {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => "Transaction failed: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        try {
            // Note: user_addresses has ON DELETE CASCADE in your schema, 
            // so deleting the user will automatically remove their addresses.
            $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
            if($stmt->execute([$user_id])) {
                echo json_encode(["success" => true, "message" => "Account and associated data removed"]);
            }
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "Deletion failed: " . $e->getMessage()]);
        }
        break;
}
?>