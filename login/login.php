<?php
session_start();

require_once '../db.php';

$email = $_POST['email'] ?? '';
$pwd = $_POST['password'] ?? '';

if (empty($email) || empty($pwd)) {
    echo "<script>alert('Per favore, inserisci email e password.'); window.location.href='./index-login.php';</script>";
    exit();
}

$stmt = $pdo->prepare("SELECT id, Nome as nome, Cognome as cognome, Password as password, Ruolo as ruolo FROM utenti WHERE Email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    if (password_verify($pwd, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_nome'] = $user['nome'];
        $_SESSION['user_cognome'] = $user['cognome'];
        $_SESSION['user_ruolo'] = $user['ruolo'];
        $_SESSION['email'] = $email; 
        $_SESSION['logged_in'] = true;

        if ($user['ruolo'] === 'operatore') {
            header("Location: ../bacheca/bacheca_x_docenti/bacheca_xdocenti.php");
            exit;
        } else {
            header("Location: ../bacheca/bacheca_x_studenti/bacheca_xstudenti.php");
            exit;
        }
    } else {
        echo "<script>alert('Email o password non validi.'); window.location.href='./index-login.php';</script>";
        exit();
    }
} else {
    echo "<script>alert('Email o password non validi.'); window.location.href='./index-login.php';</script>";
    exit();
}
?>
