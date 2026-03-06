<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);
header("Content-Type: application/json");
require_once '../../db.php';

try {
    $stmt = $pdo->query("SELECT * FROM pcto ORDER BY created_at DESC");
    $pctos = $stmt->fetchAll();
    echo json_encode($pctos);
} catch (PDOException $e) {
    echo json_encode([]);
}
?>
