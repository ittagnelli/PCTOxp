<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['email'])) {
    echo json_encode(['success' => false, 'error' => 'Utente non autenticato']);
    exit;
}

require_once '../db.php';

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

// Note: GROUP_CONCAT with ORDER BY and SEPARATOR is not exactly the same in SQLite.
// SQLite syntax: GROUP_CONCAT(expression, separator)
// To have order, we might need a subquery or do it in PHP if the query fails.
// Let's adapt to a simpler SQLite-compatible GROUP_CONCAT first.

$query_sqlite = "
    SELECT 
        p.id as pcto_id,
        p.title as pcto_title,
        COUNT(i.studente_id) as num_iscritti,
        GROUP_CONCAT(u.Nome || ' ' || u.Cognome, ', ') as studenti_iscritti
    FROM pcto p
    LEFT JOIN iscrizioni i ON p.id = i.pcto_id
    LEFT JOIN utenti u ON i.studente_id = u.id
    GROUP BY p.id, p.title
    ORDER BY p.created_at DESC
";

$stmt = $pdo->query($query_sqlite);
$pcto_iscrizioni = [];

while ($row = $stmt->fetch()) {
    $pcto_iscrizioni[] = [
        'pcto_id' => intval($row['pcto_id']),
        'pcto_title' => $row['pcto_title'],
        'num_iscritti' => intval($row['num_iscritti']),
        'studenti_iscritti' => $row['studenti_iscritti'] ? explode(', ', $row['studenti_iscritti']) : []
    ];
}

echo json_encode(['success' => true, 'data' => $pcto_iscrizioni]);
?>
