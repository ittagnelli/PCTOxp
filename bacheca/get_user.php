<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['email'])) {
    echo json_encode(["error" => "Utente non autenticato"]);
    exit;
}

require_once '../db.php';

$email = $_SESSION['email'];
$stmt = $pdo->prepare("SELECT Nome as nome, Cognome as cognome, Img_profilo as img_profilo FROM utenti WHERE Email = ?");
$stmt->execute([$email]);

if ($row = $stmt->fetch()) {
    if (empty($row['img_profilo'])) {
        $row['img_profilo'] = '../../aggiunta_pcto/assets/logo/blue-profile-icon-free-png.webp';
    }
    echo json_encode($row);
} else {
    echo json_encode(["error" => "Utente non trovato"]);
}
?>
