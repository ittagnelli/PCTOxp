<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['email'])) {
    echo json_encode(['success' => false, 'error' => 'Utente non autenticato']);
    exit;
}

require_once '../db.php';

$email = $_SESSION['email'];
$stmt = $pdo->prepare("SELECT id FROM utenti WHERE Email = ?");
$stmt->execute([$email]);
$utente = $stmt->fetch();

if (!$utente) {
    echo json_encode(['success' => false, 'error' => 'Utente non trovato']);
    exit;
}

$studente_id = $utente['id'];

$stmt = $pdo->prepare("SELECT pcto_id FROM iscrizioni WHERE studente_id = ?");
$stmt->execute([$studente_id]);

$iscrizioni = [];
while ($row = $stmt->fetch()) {
    $iscrizioni[] = intval($row['pcto_id']);
}

echo json_encode(['success' => true, 'iscrizioni' => $iscrizioni]);
?>
