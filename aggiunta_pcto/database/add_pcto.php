<?php
header("Content-Type: application/json");
require_once '../../db.php';

$title = $_POST["title"] ?? "";
$desc  = $_POST["desc"] ?? "";
$start = $_POST["start"] ?? "";
$end   = $_POST["end"] ?? "";

if (!$title || !$desc || !$start || !$end) {
    echo json_encode(["success" => false, "error" => "Compila tutti i campi"]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO pcto (title, description, start_date, end_date) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$title, $desc, $start, $end])) {
        // SQLite date deletion: datetime('now', '-1 year')
        $pdo->exec("DELETE FROM pcto WHERE created_at < datetime('now', '-1 year')");
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    } else {
        echo json_encode(["success" => false, "error" => "Errore durante l'inserimento"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
