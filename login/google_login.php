<?php
header('Cross-Origin-Opener-Policy: same-origin-allow-popups');
header('Cross-Origin-Embedder-Policy: unsafe-none');

header('Access-Control-Allow-Origin: *');
header('X-Frame-Options: SAMEORIGIN');

use Google\Client as Google_Client;
use GuzzleHttp\Client as GuzzleHttpClient;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
session_start();
header('Content-Type: application/json');

require_once '../db.php';

$credential = $_POST['credential'] ?? '';

if (empty($credential)) {
    echo json_encode(['success' => false, 'error' => 'Token mancante']);
    exit();
}

try {
    require_once './vendor/autoload.php';
    $client_id = '888476805039-939mpjj3ant15063om190354dhotu1hh.apps.googleusercontent.com';
    $client = new Google_Client(['client_id' => $client_id]);
    $client->setClientId($client_id);
    $client->setHttpClient(new GuzzleHttpClient(['verify' => false]));
    
    $payload = $client->verifyIdToken($credential);
    
    if ($payload) {
        $email = $payload['email'];
        $img_profilo = $payload['picture'] ?? null;

        $domain = '@istitutoagnelli.it';
        $myEmail = 'gabriele.savio2008@gmail.com';
        if (substr($email, -strlen($domain)) !== $domain && $email !== $myEmail) {
            echo json_encode(['success' => false, 'error' => 'Accesso consentito solo con email @istitutoagnelli.it']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT id, Nome as nome, Cognome as cognome, Ruolo as ruolo FROM utenti WHERE Email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
 
         if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_nome'] = $user['nome'];
            $_SESSION['user_cognome'] = $user['cognome'];
            $_SESSION['user_ruolo'] = $user['ruolo'];
            $_SESSION['email'] = $email;
            $_SESSION['logged_in'] = true;

            $update_stmt = $pdo->prepare("UPDATE utenti SET Img_profilo = ? WHERE id = ?");
            $update_stmt->execute([$img_profilo, $user['id']]);

            $redirect_url = ($user['ruolo'] === 'operatore') ? '../bacheca/bacheca_x_docenti/bacheca_xdocenti.php' : '../bacheca/bacheca_x_studenti/bacheca_xstudenti.php';
            echo json_encode(['success' => true, 'redirect' => $redirect_url]);

        } else {
            // Restriction: Only save teachers/users already in DB
            echo json_encode(['success' => false, 'error' => 'Accesso non autorizzato. Solo i docenti registrati possono accedere.']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Token Google non valido']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Errore verifica token Google: ' . $e->getMessage()]);
}
?>
