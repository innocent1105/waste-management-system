<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

require_once 'connection.php';

try {
    $searchTerm = isset($_GET['search']) ? '%' . $_GET['search'] . '%' : '%';
    $activeCat = isset($_GET['category']) ? $_GET['category'] : 'All';

    // 1. Fetch Transactions
    $query = "
        SELECT 
            t.transaction_reference as id,
            t.payment_method as shop, 
            DATE_FORMAT(t.created_at, '%b %d, %Y') as date,
            t.amount,
            t.payment_status as status,
            'Tech' as cat -- Replace with actual category column if available
        FROM transactions t
        JOIN orders o ON t.order_id = o.id
        WHERE (t.transaction_reference LIKE ? OR t.payment_method LIKE ?)
    ";

    $params = [$searchTerm, $searchTerm];
    if ($activeCat !== 'All') {
        $query .= " AND 'Tech' = ? "; 
        $params[] = $activeCat;
    }

    $query .= " ORDER BY t.created_at DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

   $statsStmt = $pdo->query("
        SELECT 
            SUM(CASE WHEN payment_status = 'SUCCESS' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN payment_status = 'PENDING' THEN amount ELSE 0 END) as pending,
            SUM(CASE WHEN payment_status = 'FAILED' THEN amount ELSE 0 END) as failed
        FROM transactions
    ");
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    $unsuccessful_total = (float)$stats['pending'] + (float)$stats['failed'];
    $income_total = (float)$stats['income'];

    $wallet_stmt = $pdo->query("SELECT balance FROM system_wallet WHERE id = 1");
    $wallet_data = $wallet_stmt->fetch(PDO::FETCH_ASSOC);

    $system_balance = (float)($wallet_data['balance'] ?? 0);
    
    echo json_encode([
        "success" => true,
        "balance" => $system_balance, 
        "income" => $income_total,
        "spending" => $unsuccessful_total, 
        "transactions" => $transactions
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}