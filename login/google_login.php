<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "pcto_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Errore database']);
    exit();
}

$credential = $_POST['credential'] ?? '';

if (empty($credential)) {
    echo json_encode(['success' => false, 'error' => 'Token mancante']);
    exit();
}

try {
    require_once '../vendor/autoload.php';
    
    $client_id = '888476805039-939mpjj3ant15063om190354dhotu1hh.apps.googleusercontent.com';
    $client = new Google\Client();
    $client->setClientId($client_id);
    
    $payload = $client->verifyIdToken($credential);

    if ($payload) {
        $google_id = $payload['sub'];
        $email = $payload['email'];
        $nome = $payload['given_name'] ?? '';
        $cognome = $payload['family_name'] ?? '';
        $img_profilo = $payload['picture'] ?? null;

        $domain = '@istitutoagnelli.it';
        $myEmail = 'gabriele.savio2008@gmail.com';
        if (substr($email, -strlen($domain)) !== $domain && $email !== $myEmail) {
            echo json_encode(['success' => false, 'error' => 'Accesso consentito solo con email @istitutoagnelli.it']);
            exit();
        }

        $stmt = $conn->prepare("SELECT id, nome, cognome, ruolo FROM utenti WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_nome'] = $user['nome'];
            $_SESSION['user_cognome'] = $user['cognome'];
            $_SESSION['user_ruolo'] = $user['ruolo'];
            $_SESSION['email'] = $email;
            $_SESSION['logged_in'] = true;

            error_log("Updating profile image: " . $img_profilo . " for user ID: " . $user['id']);
            $update_stmt = $conn->prepare("UPDATE utenti SET Img_profilo = ? WHERE id = ?");
            $update_stmt->bind_param("si", $img_profilo, $user['id']);
            $update_stmt->execute();
            $update_stmt->close();

            $redirect_url = ($user['ruolo'] === 'operatore') ? '../bacheca/bacheca x docenti/bacheca_xdocenti.php' : '../bacheca/bacheca x studenti/bacheca_xstudenti.php';
            echo json_encode(['success' => true, 'redirect' => $redirect_url]);

        } else {
            $default_ruolo = 'utente';
            $password_placeholder = password_hash(uniqid(rand(), true), PASSWORD_DEFAULT);

            $insert_stmt = $conn->prepare("INSERT INTO utenti (nome, cognome, email, password, ruolo, Img_profilo) VALUES (?, ?, ?, ?, ?, ?)");
            $insert_stmt->bind_param("ssssss", $nome, $cognome, $email, $password_placeholder, $default_ruolo, $img_profilo);

            if ($insert_stmt->execute()) {
                $_SESSION['user_id'] = $insert_stmt->insert_id;
                $_SESSION['user_nome'] = $nome;
                $_SESSION['user_cognome'] = $cognome;
                $_SESSION['user_ruolo'] = $default_ruolo;
                $_SESSION['email'] = $email;
                $_SESSION['logged_in'] = true;

                $redirect_url = ($default_ruolo === 'operatore') ? '../bacheca/bacheca x docenti/bacheca_xdocenti.php' : '../bacheca/bacheca x studenti/bacheca_xstudenti.php';
                echo json_encode(['success' => true, 'redirect' => $redirect_url]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Errore registrazione utente']);
            }
            $insert_stmt->close();
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Token Google non valido']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Errore verifica token Google']);
}

$conn->close();
?>
