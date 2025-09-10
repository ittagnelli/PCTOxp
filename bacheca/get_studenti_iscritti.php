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

$query = "
    SELECT 
        p.id as pcto_id,
        p.title as pcto_title,
        COUNT(i.studente_id) as num_iscritti,
        GROUP_CONCAT(
            CONCAT(u.Nome, ' ', u.Cognome) 
            ORDER BY u.Cognome, u.Nome 
            SEPARATOR ', '
        ) as studenti_iscritti
    FROM pcto p
    LEFT JOIN iscrizioni i ON p.id = i.pcto_id
    LEFT JOIN utenti u ON i.studente_id = u.id
    GROUP BY p.id, p.title
    ORDER BY p.created_at DESC
";

$result = $conn->query($query);
$pcto_iscrizioni = [];

while ($row = $result->fetch_assoc()) {
    $pcto_iscrizioni[] = [
        'pcto_id' => intval($row['pcto_id']),
        'pcto_title' => $row['pcto_title'],
        'num_iscritti' => intval($row['num_iscritti']),
        'studenti_iscritti' => $row['studenti_iscritti'] ? explode(', ', $row['studenti_iscritti']) : []
    ];
}

$conn->close();

echo json_encode(['success' => true, 'data' => $pcto_iscrizioni]);
?>
