<?php
$servername = "localhost";
$username = "root";
$password = "";    
$dbname = "pcto_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
}

$cognome = strtolower(trim($_POST['cognome']));
$nome = strtolower(trim($_POST['nome']));
$pwd = $_POST['password'];
$ruolo = $_POST['ruolo'];

$email = $nome . "." . $cognome . "@istitutoagnelli.it";

$pwd_hash = password_hash($pwd, PASSWORD_DEFAULT);

/* $img_profilo = null;

if (isset($_FILES['img_profilo']) && $_FILES['img_profilo']['error'] === UPLOAD_ERR_OK) {
    $fileType = $_FILES['img_profilo']['type'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (in_array($fileType, $allowedTypes) && $_FILES['img_profilo']['size'] <= 2 * 1024 * 1024) {
        $imageData = file_get_contents($_FILES['img_profilo']['tmp_name']);
        $img_profilo = 'data:' . $fileType . ';base64,' . base64_encode($imageData);
    }
} */

$stmt = $conn->prepare("INSERT INTO utenti (nome, cognome, email, password, ruolo) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $nome, $cognome, $email, $pwd_hash, $ruolo);

if ($stmt->execute()) {
    echo "Account creato con successo!<br>";
    echo "Email: " . $email;
} else {
    echo "Account gia esistente";
}

$stmt->close();
$conn->close();
?>
