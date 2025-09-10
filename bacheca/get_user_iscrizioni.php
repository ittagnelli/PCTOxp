<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['email'])) {
    echo json_encode(['success' => false, 'error' => 'Utente non autenticato']);
    exit;
}

$conn = new mysqli("localhost", "root", "", "pcto_db");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Errore di connessione al database']);
    exit;
}

$email = $_SESSION['email'];
$stmt = $conn->prepare("SELECT id FROM utenti WHERE Email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$utente = $result->fetch_assoc();
$stmt->close();

if (!$utente) {
    echo json_encode(['success' => false, 'error' => 'Utente non trovato']);
    exit;
}

$studente_id = $utente['id'];

$stmt = $conn->prepare("SELECT pcto_id FROM iscrizioni WHERE studente_id = ?");
$stmt->bind_param("i", $studente_id);
$stmt->execute();
$result = $stmt->get_result();

$iscrizioni = [];
while ($row = $result->fetch_assoc()) {
    $iscrizioni[] = intval($row['pcto_id']);
}

$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'iscrizioni' => $iscrizioni]);
?>
