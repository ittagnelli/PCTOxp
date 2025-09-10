<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['email'])) {
    echo json_encode(["error" => "Utente non autenticato"]);
    exit;
}

$conn = new mysqli("localhost", "root", "", "pcto_db");
if ($conn->connect_error) {
    echo json_encode(["error" => "Connessione fallita"]);
    exit;
}

$email = $_SESSION['email'];
$stmt = $conn->prepare("SELECT Nome as nome, Cognome as cognome, Img_profilo as img_profilo FROM utenti WHERE Email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (empty($row['img_profilo'])) {
        $row['img_profilo'] = '../aggiunta pcto/assets/logo/blue-profile-icon-free-png.webp';
    }
    echo json_encode($row);
} else {
    echo json_encode(["error" => "Utente non trovato"]);
}

$stmt->close();
$conn->close();
?>
