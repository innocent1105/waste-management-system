<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle CORS Preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'connection.php';

// Get data from POST body
$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_token'] ?? null; 

try {
    if (!$user_id) {
        throw new Exception("Unauthorized: No user token provided.");
    }

    $search = $data['params']['search'] ?? '';
    $searchTerm = '%' . $search . '%';

    // 1. Fetch Transactions linked to Waste Orders
    $query = "
        SELECT 
            t.transaction_reference as id,
            t.payment_method as shop, 
            DATE_FORMAT(t.created_at, '%b %d, %Y') as date,
            t.amount,
            t.status,
            o.order_id,
            o.pickup_address
        FROM transactions t
        JOIN orders o ON t.order_id = o.order_id
        WHERE o.user_id = ? 
        AND (t.transaction_reference LIKE ? OR o.order_id LIKE ?)
        ORDER BY t.created_at DESC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute([$user_id, $searchTerm, $searchTerm]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Calculate Stats
    $statsQuery = "
        SELECT 
            SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN status != 'SUCCESS' THEN amount ELSE 0 END) as spending
        FROM transactions 
        WHERE user_id = ?
    ";
    $statsStmt = $pdo->prepare($statsQuery);
    $statsStmt->execute([$user_id]);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    // 3. Get Wallet Balance
    $walletStmt = $pdo->prepare("SELECT balance FROM user_wallets WHERE user_id = ?");
    $walletStmt->execute([$user_id]);
    $wallet = $walletStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "balance" => (float)($wallet['balance'] ?? 0),
        "income" => (float)($stats['income'] ?? 0),
        "spending" => (float)($stats['spending'] ?? 0),
        "transactions" => $transactions
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}