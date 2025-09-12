-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 10, 2025 alle 22:13
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pcto_db`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `iscrizioni`
--

CREATE TABLE `iscrizioni` (
  `id` int(10) UNSIGNED NOT NULL,
  `studente_id` int(10) UNSIGNED NOT NULL,
  `pcto_id` int(10) UNSIGNED NOT NULL,
  `data_iscrizione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `iscrizioni`
--

INSERT INTO `iscrizioni` (`id`, `studente_id`, `pcto_id`, `data_iscrizione`) VALUES
(8, 1, 18, '2025-09-10 17:34:06'),
(9, 1, 22, '2025-09-10 17:34:23'),
(10, 1, 26, '2025-09-10 17:34:25');

-- --------------------------------------------------------

--
-- Struttura della tabella `pcto`
--

CREATE TABLE `pcto` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `pcto`
--

INSERT INTO `pcto` (`id`, `title`, `description`, `start_date`, `end_date`, `created_at`) VALUES
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

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti`
--

CREATE TABLE `utenti` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(50) NOT NULL,
  `cognome` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `ruolo` enum('utente','operatore') NOT NULL,
  `Img_profilo` longblob NOT NULL,
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`id`, `nome`, `cognome`, `email`, `password`, `ruolo`, `Img_profilo`, `data_creazione`) VALUES
(1, 'gabriele', 'savio', 'gabriele.savio@istitutoagnelli.it', '$2y$10$lQOmciwpkV2P1V9RxVaq2OAxj8EH5NyvS7xVCsFCChdCNyiUt.5my', 'utente', 0x75706c6f6164732f64656661756c742e706e67, '2025-09-05 13:21:30'),
(3, 'antonio', 'mancuso', 'antonio.mancuso@istitutoagnelli.it', '$2y$10$wS6wvRUm4f2fukit/0stjuZm571WGjHlQfD0YuKX2roUe0PMJnpFm', 'operatore', 0x75706c6f6164732f64656661756c742e706e67, '2025-09-05 13:22:33');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `iscrizioni`
--
ALTER TABLE `iscrizioni`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `studente_id` (`studente_id`,`pcto_id`),
  ADD KEY `pcto_id` (`pcto_id`);

--
-- Indici per le tabelle `pcto`
--
ALTER TABLE `pcto`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `iscrizioni`
--
ALTER TABLE `iscrizioni`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT per la tabella `pcto`
--
ALTER TABLE `pcto`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT per la tabella `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `iscrizioni`
--
ALTER TABLE `iscrizioni`
  ADD CONSTRAINT `iscrizioni_ibfk_1` FOREIGN KEY (`studente_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `iscrizioni_ibfk_2` FOREIGN KEY (`pcto_id`) REFERENCES `pcto` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
