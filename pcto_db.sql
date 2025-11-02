CREATE DATABASE IF NOT EXISTS pcto_db;
USE pcto_db;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS iscrizioni (
  id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  studente_id INT(10) UNSIGNED NOT NULL,
  pcto_id INT(10) UNSIGNED NOT NULL,
  data_iscrizione TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO iscrizioni (studente_id, pcto_id, data_iscrizione) VALUES
(1, 17, '2025-10-02 22:43:29'),
(1, 18, '2025-10-02 22:43:33');

CREATE TABLE IF NOT EXISTS pcto (
  id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO pcto (id, title, description, start_date, end_date, created_at) VALUES
(15, 'Stage in Azienda Meccanica', 'Percorso PCTO dedicato alla meccanica industriale con esercitazioni pratiche sui macchinari.', '2025-09-10', '2025-09-20', '2025-09-10 17:30:55'),
(16, 'Laboratorio di Robotica', 'Esperienza di PCTO focalizzata sulla programmazione e costruzione di robot autonomi.', '2025-09-15', '2025-09-30', '2025-09-10 17:30:55'),
(17, 'Corso di Sicurezza Informatica', 'Formazione sulla cybersecurity e la protezione dei dati aziendali.', '2025-10-01', '2025-10-10', '2025-09-10 17:30:55'),
(18, 'Progetto Web Development', 'Sviluppo di un sito web completo in HTML, CSS, JavaScript e PHP.', '2025-10-05', '2025-10-15', '2025-09-10 17:30:55'),
(19, 'Workshop di Intelligenza Artificiale', 'Introduzione al machine learning e alle reti neurali con esempi pratici.', '2025-10-20', '2025-10-30', '2025-09-10 17:30:55'),
(20, 'Stage in Laboratorio Chimico', 'Attività di ricerca e analisi chimica in laboratorio con attrezzature professionali.', '2025-11-01', '2025-11-10', '2025-09-10 17:30:55'),
(21, 'Percorso di Elettronica Avanzata', 'Apprendimento di tecniche avanzate di elettronica e microcontrollori.', '2025-11-05', '2025-11-18', '2025-09-10 17:30:55'),
(22, 'Corso di Marketing Digitale', 'Strategie di marketing per aziende moderne, con focus su social media e SEO.', '2025-11-10', '2025-11-20', '2025-09-10 17:30:55'),
(23, 'Introduzione al CAD 3D', 'Progettazione di modelli 3D tramite software CAD professionali.', '2025-11-15', '2025-11-25', '2025-09-10 17:30:55'),
(24, 'Esperienza in Startup Innovativa', 'Collaborazione con una startup per sviluppare idee e progetti reali.', '2025-12-01', '2025-12-15', '2025-09-10 17:30:55'),
(25, 'Progetto di Sostenibilità Ambientale', 'Attività dedicate alla protezione dell’ambiente e all’innovazione green.', '2025-12-05', '2025-12-20', '2025-09-10 17:30:55'),
(26, 'Formazione su Arduino e IoT', 'Progettazione e sviluppo di sistemi IoT utilizzando Arduino e sensori.', '2025-12-10', '2025-12-22', '2025-09-10 17:30:55');

CREATE TABLE IF NOT EXISTS utenti (
  id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  Nome VARCHAR(50) NOT NULL,
  Cognome VARCHAR(50) NOT NULL,
  Email VARCHAR(100) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Ruolo ENUM('utente','operatore') NOT NULL,
  Img_profilo MEDIUMTEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY Email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO utenti (id, Nome, Cognome, Email, Password, Ruolo, Img_profilo, created_at) VALUES
(1, 'Gabriele', 'SAVIO', 'gabriele.savio@istitutoagnelli.it', '$2y$10$gQt8AQGFeyE8SwU7DNbOUOjuymubjytKSNCuTyN/2W.otzzt.xWh6', 'utente', NULL, '2025-10-02 22:42:44'),
(2, 'Gabriele', 'Savio', 'gabriele.savio2008@gmail.com', '$2y$10$J73ddyf9QU46QIvVKR7tKeuXaiszacsCIn0byrykNG7WsJv3W49wS', 'operatore', 'https://lh3.googleusercontent.com/a/ACg8ocIc8gif2QovJxqiFF-ECxVltXghcXfBZ2npob-EjWvGK6K-ivxb=s96-c', '2025-10-02 22:45:51');
