<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

require_once 'connection.php';

try {
    $searchTerm = isset($_GET['search']) ? '%' . $_GET['search'] . '%' : '%';
    $activeCat = isset($_GET['category']) ? $_GET['category'] : 'All';

    // 1. Build Query - Filtering by status or payment_method makes more sense for your schema
    $query = "
        SELECT 
            t.transaction_reference as id,
            t.payment_method as shop, 
            DATE_FORMAT(t.created_at, '%b %d, %Y') as date,
            t.amount,
            t.status,
            u.full_name as user_name
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.user_id
        WHERE (t.transaction_reference LIKE ? OR u.full_name LIKE ? OR t.payment_method LIKE ?)
    ";

    $params = [$searchTerm, $searchTerm, $searchTerm];
    
    // Logic: If user selects a status category (SUCCESS, PENDING, FAILED)
    if ($activeCat !== 'All') {
        $query .= " AND t.status = ? "; 
        $params[] = strtoupper($activeCat);
    }

    $query .= " ORDER BY t.created_at DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Fetch Aggregated Stats
    $statsStmt = $pdo->query("
        SELECT 
            SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN status = 'FAILED' THEN amount ELSE 0 END) as failed
        FROM transactions
    ");
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    // 3. Get System Balance
    $system_balance = $pdo->query("SELECT balance FROM system_wallet LIMIT 1")->fetchColumn() ?: 0;
    
    echo json_encode([
        "success" => true,
        "balance" => (float)$system_balance, 
        "income" => (float)$stats['income'],
        "spending" => (float)$stats['failed'], 
        "transactions" => $transactions
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}