<?php
session_start();

if (!isset($_SESSION['email'])) {
    header("Location: ../../login/index-login.php");
    exit;
}


$conn = new mysqli("localhost", "root", "", "pcto_db");
if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
}

$email = $_SESSION['email'];
$stmt = $conn->prepare("SELECT Nome, Cognome, Img_profilo FROM utenti WHERE Email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$utente = $result->fetch_assoc();

$stmt->close();
$conn->close();

if (empty($utente['Img_profilo'])) {
    $utente['Img_profilo'] = '../../aggiunta_pcto/assets/logo/blue-profile-icon-free-png.webp';
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="../style.css" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
    />
    <title>Bacheca PCTO</title>
  </head>
  <body>
    <div class="navbar">
      <img
        id="img-profilo"
        src="<?php echo htmlspecialchars($utente['Img_profilo']); ?>"
        alt="Immagine profilo di <?php echo htmlspecialchars($utente['Nome'] . ' ' . $utente['Cognome']); ?>"
        onerror="this.src='../../aggiunta_pcto/assets/logo/blue-profile-icon-free-png.webp'; this.onerror=null;"
        loading="lazy"
      />
      <h3 id="h3"><?php echo htmlspecialchars($utente['Nome'] . " " . $utente['Cognome']); ?></h3>
      <div class="login">
        <a href="../../login/logout.php" class="logout-btn">
          <span class="material-icons">account_circle</span>
          Logout
        </a>
      </div>
    </div>

    <div class="bacheca-content">
      <div id="pcto-info-box">
      </div>
    </div>

    <script src="./script_bacheca_xstudenti.js"></script>
  </body>
</html>
