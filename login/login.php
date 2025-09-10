<?php
session_start();

$servername = "localhost";
$username = "root"; 
$password = "";     
$dbname = "pcto_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
}

$email = $_POST['email'] ?? '';
$pwd = $_POST['password'] ?? '';

if (empty($email) || empty($pwd)) {
    header("Location: login.html?error=Per favore, inserisci email e password.");
    exit();
}

$stmt = $conn->prepare("SELECT id, nome, cognome, password, ruolo FROM utenti WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($pwd, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_nome'] = $user['nome'];
        $_SESSION['user_cognome'] = $user['cognome'];
        $_SESSION['user_ruolo'] = $user['ruolo'];
        $_SESSION['logged_in'] = true;

        if ($user['ruolo'] === 'operatore') {
            session_start();
            $_SESSION['email'] = $email;
            header("Location: ../bacheca/bacheca x docenti/bacheca_xdocenti.php");
            exit;
        } else {
            session_start();
            $_SESSION['email'] = $email;
            header("Location: ../bacheca/bacheca x studenti/bacheca_xstudenti.php"); 
            exit;
        }
        exit();
    } else {
        header("Location: login.html?error=Email o password non validi.");
        exit();
    }
} else {
echo "<script>alert('email o password errati'); window.location.href='./index-login.html';</script>";
exit;
}

$stmt->close();
$conn->close();
?>
