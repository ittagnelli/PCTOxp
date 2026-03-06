<?php
header("Content-Type: application/json");

require_once '../db.php';

$stmt = $pdo->query("SELECT * FROM pcto ORDER BY created_at DESC");
$pctos = $stmt->fetchAll();

echo json_encode($pctos);
?>
