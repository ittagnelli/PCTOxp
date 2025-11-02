<?php
header('Access-Control-Allow-Origin: *');
header('X-Frame-Options: ALLOWALL');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

debug_print_backtrace();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>

<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="style.css" />
    <title>Login - PCTOxp</title>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
  </head>
  <body>
    <div class="login-container">
      <div class="logo">
        <img
          src="../aggiunta_pcto/assets/logo/logo_PCTOxp.png"
          alt="Logo PCTOxp"
        />
      </div>
      <h2>Accedi con Google</h2>
      <p class="info-text">
        Utilizza il tuo account istituzionale agnelli per accedere
      </p>

      <div
        class="g_id_signin singin-google"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="signin_with"
        data-shape="rectangular"
        data-logo_alignment="left"
      ></div>
    </div>
    <script>
      window.onload = function () {
        google.accounts.id.initialize({
          client_id: "888476805039-939mpjj3ant15063om190354dhotu1hh.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
          use_fedcm_for_prompt: true,
        });

        google.accounts.id.renderButton(document.querySelector(".g_id_signin"), {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
      };

      function handleCredentialResponse(response) {
        if (!response.credential) {
          alert("Errore di autenticazione.");
          return;
        }

        fetch("google_login.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `credential=${encodeURIComponent(response.credential)}`,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              console.log("1")
              console.log(data);
              window.location.href = data.redirect;
            } else {
              alert("Errore di autenticazione Google: " + (data.error || "Errore"));
            }
          })
          .catch(() => alert("Errore di connessione durante il login."));
      }
    </script>
  </body>
</html>
