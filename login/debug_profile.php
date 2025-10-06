<?php
$conn = new mysqli("localhost", "root", "", "pcto_db");
if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
}

$result = $conn->query("SELECT id, nome, cognome, email, Img_profilo FROM utenti ORDER BY id DESC LIMIT 5");

echo "<h2>Ultimi 5 utenti e le loro immagini profilo:</h2>";
while($row = $result->fetch_assoc()) {
    echo "<div style='border:1px solid #ccc; margin:10px; padding:10px;'>";
    echo "<strong>ID:</strong> " . $row['id'] . "<br>";
    echo "<strong>Nome:</strong> " . $row['nome'] . " " . $row['cognome'] . "<br>";
    echo "<strong>Email:</strong> " . $row['email'] . "<br>";
    echo "<strong>Img_profilo:</strong> " . ($row['Img_profilo'] ?: 'NULL') . "<br>";
    
    if ($row['Img_profilo']) {
        echo "<img src='" . $row['Img_profilo'] . "' style='width:50px; height:50px; border-radius:50%;' onerror='this.style.display=\"none\"'><br>";
    }
    echo "</div>";
}

$conn->close();
?>
