<?php
session_start();
session_destroy();
header("Location: ../bacheca/bacheca_x_tutti/bacheca_xtutti.html");
exit;
?>
