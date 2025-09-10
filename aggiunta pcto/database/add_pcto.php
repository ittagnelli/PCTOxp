<?php
header("Content-Type: application/json");

$host = "localhost";
$user = "root";
$pass = "";    
$db   = "pcto_db";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connessione fallita: " . $conn->connect_error]);
    exit;
}

$title = $_POST["title"] ?? "";
$desc  = $_POST["desc"] ?? "";
$start = $_POST["start"] ?? "";
$end   = $_POST["end"] ?? "";

if (!$title || !$desc || !$start || !$end) {
    echo json_encode(["success" => false, "error" => "Compila tutti i campi"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO pcto (title, description, start_date, end_date) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $title, $desc, $start, $end);

if ($stmt->execute()) {
    $conn->query("DELETE FROM pcto WHERE created_at < (NOW() - INTERVAL 1 YEAR)");
    echo json_encode(["success" => true, "id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
