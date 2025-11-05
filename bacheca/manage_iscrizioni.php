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
        $stmt = $conn->prepare("INSERT INTO iscrizioni (studente_id, pcto_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $studente_id, $pcto_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Iscrizione avvenuta con successo']);
        } else {
            if ($conn->errno === 1062) {
                echo json_encode(['success' => false, 'error' => 'Sei già iscritto a questo PCTO']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Errore durante l\'iscrizione']);
            }
        }
    } else if ($action === 'disiscrivi') {
        $stmt = $conn->prepare("DELETE FROM iscrizioni WHERE studente_id = ? AND pcto_id = ?");
        $stmt->bind_param("ii", $studente_id, $pcto_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Disiscrizione avvenuta con successo']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Errore durante la disiscrizione']);
        }
    }

    if ($elimina !== null) {
        $stmt = $conn->prepare("DELETE FROM pcto WHERE id = ?");
        $stmt->bind_param("i", $pcto_id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'PCTO eliminato con successo']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Errore durante l\'eliminazione del PCTO']);
        }
    }

    
    $stmt->close();
}

$conn->close();
?>
