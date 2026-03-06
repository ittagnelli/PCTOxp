<?php
$host = getenv('MYSQL_HOST') ?: null;
$db   = getenv('MYSQL_DATABASE') ?: null;
$user = getenv('MYSQL_USER') ?: null;
$pass = getenv('MYSQL_PASSWORD') ?: null;
$charset = 'utf8mb4';

try {
    if ($host && $db) {
        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, $user, $pass, $options);
    } else {
        $db_path = __DIR__ . '/pcto.db';
        $pdo = new PDO("sqlite:" . $db_path);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    }
} catch (PDOException $e) {
    die("Connessione al database fallita: " . $e->getMessage());
}
?>
