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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['pcto_id'])) {
        echo json_encode(['success' => false, 'error' => 'ID PCTO non fornito']);
        exit;
    }
    
    $pcto_id = isset($input['pcto_id']) ? intval($input['pcto_id']) : null;
    $action  = isset($input['action']) ? $input['action'] : null;
    $elimina = isset($input['elimina']) ? intval($input['elimina']) : null;
    
    if ($action === 'iscriviti') {
        try {
            $stmt = $pdo->prepare("INSERT INTO iscrizioni (studente_id, pcto_id) VALUES (?, ?)");
            if ($stmt->execute([$studente_id, $pcto_id])) {
                echo json_encode(['success' => true, 'message' => 'Iscrizione avvenuta con successo']);
            }
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Unique constraint violation
                echo json_encode(['success' => false, 'error' => 'Sei già iscritto a questo PCTO']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Errore durante l\'iscrizione']);
            }
        }
    } else if ($action === 'disiscrivi') {
        $stmt = $pdo->prepare("DELETE FROM iscrizioni WHERE studente_id = ? AND pcto_id = ?");
        if ($stmt->execute([$studente_id, $pcto_id])) {
            echo json_encode(['success' => true, 'message' => 'Disiscrizione avvenuta con successo']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Errore durante la disiscrizione']);
        }
    }

    if ($elimina !== null) {
        $stmt = $pdo->prepare("DELETE FROM pcto WHERE id = ?");
        if ($stmt->execute([$pcto_id])) {
            echo json_encode(['success' => true, 'message' => 'PCTO eliminato con successo']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Errore durante l\'eliminazione del PCTO']);
        }
    }
}
?>
