<?php
session_start();

if (!isset($_SESSION['email'])) {
    header("Location: ../login/index-login.html");
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
    $utente['Img_profilo'] = './assets/logo/blue-profile-icon-free-png.webp';
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="style.css" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
    />
    <title></title>
  </head>
  <body>
    <div class="navbar">
      <img
        id="img-profilo"
        src="<?php echo !empty($utente['Img_profilo']) ? htmlspecialchars($utente['Img_profilo']) : './assets/logo/blue-profile-icon-free-png.webp'; ?>"
        alt="Immagine profilo di <?php echo htmlspecialchars($utente['Nome'] . ' ' . $utente['Cognome']); ?>"
        onerror="this.src='./assets/logo/blue-profile-icon-free-png.webp'; this.onerror=null;"
        loading="lazy"
      />
      <h3 id="h3"><?php echo htmlspecialchars($utente['Nome'] . " " . $utente['Cognome']); ?></h3>
      <div class="login">
        <div class="nav-element" onclick="window.location.href = '../bacheca/bacheca_x_docenti/bacheca_xdocenti.php'">
          <span class="material-icons icon">view_timeline</span>
          <span class="text">Bacheca</span>
        </div>
        <div class="nav-element" onclick="window.location.href='./index_add_pcto.php'">
          <span class="material-icons icon">add</span>
          <span class="text">Aggiungi PCTO</span>
        </div>
        <a href="../login/logout.php" class="logout-btn">
          <span class="material-icons">account_circle</span>
          Logout
        </a>
      </div>
    </div>
    <div class="input-container">
      <form id="pcto-form">
        <h3 class="PCTO">Inserisci PCTO:</h3>
        <input type="text" name="PCTO" id="pcto-title" required />
        <h3 class="details">Dettagli PCTO:</h3>
        <textarea id="pcto-desc" rows="6" required></textarea>
        <input type="submit" value="Inserisci pcto" id="submit" />
      </form>
    </div>
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="selected-dates">
          <input type="text" id="startDate" readonly placeholder="Start" />
          <input type="text" id="endDate" readonly placeholder="End" />
        </div>
        <div class="weekdays">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </div>
      </div>
      <div class="clendar-body" id="calendarBody"></div>
    </div>

    <div class="bacheca">
      <h3 id="bacheca-title">Bacheca</h3>
      <div id="pcto-info-box"></div>
    </div>

    <script src="./script.js"></script>
  </body>
</html>
