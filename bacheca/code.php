<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "pcto_db");
if ($conn->connect_error) {
    echo json_encode([]);
    exit;
}

$result = $conn->query("SELECT * FROM pcto ORDER BY created_at DESC");
$pctos = [];

while ($row = $result->fetch_assoc()) {
    $pctos[] = $row;
}

echo json_encode($pctos);
$conn->close();
?>
