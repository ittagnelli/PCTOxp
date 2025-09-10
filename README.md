# PCTOxp

![Logo PCTOxp]([https://github.com/ittagnelli/PCTOxp/blob/main/assets/logo/logo_PCTOxp.png](https://github.com/ittagnelli/PCTOxp/blob/main/aggiunta%20pcto/assets/logo/logo_PCTOxp.png))<br><br>
PCTO Explorer è il sistema di presentazione e prenotazione PCTO dell'Istituto Agnelli

## Descrizione

PCTOxp è una piattaforma web completa per la gestione dei Percorsi per le Competenze Trasversali e l'Orientamento (PCTO) presso l'Istituto Agnelli. Il sistema permette agli studenti di visualizzare e iscriversi ai PCTO disponibili, mentre i docenti possono creare nuovi percorsi e monitorare le iscrizioni.

## Funzionalità

### Per gli Studenti
- **Visualizzazione PCTO**: Consulta tutti i percorsi PCTO disponibili
- **Iscrizione automatica**: Un click per iscriversi ai percorsi di interesse
- **Stato iscrizione**: Visualizzazione dello stato di iscrizione (bottone verde se già iscritto)
- **Persistenza**: Lo stato delle iscrizioni rimane salvato tra le sessioni

### Per i Docenti
- **Creazione PCTO**: Aggiungi nuovi percorsi con titolo, descrizione e date
- **Calendario interattivo**: Seleziona facilmente le date di inizio e fine
- **Monitoraggio iscrizioni**: Visualizza il numero e l'elenco degli studenti iscritti
- **Gestione completa**: Supervisiona tutti i percorsi PCTO attivi

### Sistema di Autenticazione
- **Login sicuro**: Autenticazione con email e password hashata
- **Ruoli utente**: Differenziazione tra studenti (utente) e docenti (operatore)
- **Sessioni**: Gestione sicura delle sessioni utente

## Tecnologie Utilizzate

### Backend
- **PHP**: Linguaggio server-side per la logica applicativa
- **MySQL**: Database relazionale per la persistenza dei dati
- **Session Management**: Gestione sicura delle sessioni utente

### Frontend
- **HTML5**: Markup semantico e accessibile
- **CSS3**: Styling moderno con Grid Layout e Flexbox
- **JavaScript (ES6+)**: Interattività lato client e chiamate AJAX
- **Material Icons**: Iconografia moderna e intuitiva

### Database
- **Tabelle principali**:
  - `utenti`: Informazioni degli utenti (studenti e docenti) con immagini profilo Base64
  - `pcto`: Percorsi PCTO con titolo, descrizione e date
  - `iscrizioni`: Relazioni molti-a-molti tra studenti e PCTO
- **Sistema immagini**: Le immagini profilo sono salvate come stringhe Base64 direttamente nel database

## Struttura del Progetto

```
PCTOxp/
├── aggiunta pcto/           # Gestione creazione PCTO
│   ├── assets/logo/         # Loghi e immagini
│   ├── database/            # API per PCTO
│   ├── index_add_pcto.php   # Interfaccia creazione PCTO
│   ├── script.js            # Logica calendario e form
│   └── style.css            # Stili per creazione PCTO
├── aggiunta studenti/       # Registrazione utenti
│   ├── aggiunta_studenti_index.html
│   └── register.php         # Elaborazione registrazione
├── bacheca/                 # Sistema bacheche
│   ├── bacheca x docenti/   # Interfaccia docenti
│   ├── bacheca x studenti/  # Interfaccia studenti
│   ├── bacheca x tutti/     # Bacheca pubblica
│   ├── get_*.php           # API per dati utente e iscrizioni
│   ├── manage_iscrizioni.php # Gestione iscrizioni
│   └── style.css           # Stili bacheche
└── login/                  # Sistema autenticazione
    ├── index-login.html    # Form di login
    ├── login.php          # Elaborazione login
    ├── logout.php         # Logout utente
    └── style.css          # Stili login
```

## Installazione e Configurazione

### Prerequisiti
- Server web (Apache/Nginx)
- PHP 7.4 o superiore
- MySQL 5.7 o superiore
- XAMPP/WAMP/LAMP (per sviluppo locale)

### Setup Database
1. Crea un database chiamato `pcto_db`
2. Esegui le seguenti query SQL:

```sql
-- Tabella utenti
CREATE TABLE utenti (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    Nome VARCHAR(50) NOT NULL,
    Cognome VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Ruolo ENUM('utente', 'operatore') NOT NULL,
    Img_profilo MEDIUMTEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella PCTO
CREATE TABLE pcto (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella iscrizioni
CREATE TABLE iscrizioni (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    studente_id INT UNSIGNED NOT NULL,
    pcto_id INT UNSIGNED NOT NULL,
    data_iscrizione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (studente_id) REFERENCES utenti(id) ON DELETE CASCADE,
    FOREIGN KEY (pcto_id) REFERENCES pcto(id) ON DELETE CASCADE,
    UNIQUE (studente_id, pcto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Configurazione
1. Clona il repository nella directory web del server
2. Configura i parametri di connessione al database nei file PHP:
   - Host: `localhost`
   - Username: `root`
   - Password: `` (vuota per XAMPP)
   - Database: `pcto_db`

## Come Utilizzare

### Primo Accesso
1. **Registrazione**: Vai su `/aggiunta studenti/aggiunta_studenti_index.html`
2. **Compila il form** con nome, cognome, password e seleziona il ruolo
3. **Email automatica**: Il sistema genera automaticamente l'email nel formato `nome.cognome@istitutoagnelli.it`

### Login
1. Accedi tramite `/login/index-login.html`
2. Inserisci email e password
3. Vieni reindirizzato alla bacheca appropriata in base al ruolo

### Per Studenti
1. **Visualizza PCTO**: Nella bacheca studenti vedrai tutti i percorsi disponibili
2. **Iscriviti**: Clicca su "Iscriviti" per iscriverti a un PCTO
3. **Conferma**: Il bottone diventerà verde e mostrerà "Iscritto"
4. **Disiscriviti**: Clicca nuovamente sul bottone verde per cancellarti

### Per Docenti
1. **Crea PCTO**: Usa "Aggiungi PCTO" per creare nuovi percorsi
2. **Compila dettagli**: Inserisci titolo, descrizione e seleziona le date dal calendario
3. **Monitora iscrizioni**: Nella bacheca docenti vedi gli studenti iscritti a ogni PCTO

## Sicurezza

- **Password hashate**: Tutte le password sono crittografate con `password_hash()`
- **Prepared statements**: Protezione contro SQL injection
- **Validazione input**: Controlli lato client e server
- **Gestione sessioni**: Sessioni sicure con controlli di autenticazione
- **Vincoli database**: Constraints per prevenire duplicazioni e inconsistenze

## Interfaccia Utente

- **Design responsive**: Adattabile a dispositivi mobili e desktop
- **Interfaccia intuitiva**: Navigazione semplice e chiara
- **Feedback visuale**: Animazioni e stati dei bottoni informativi
- **Calendario interattivo**: Selezione date facile e visuale
- **Griglia adattiva**: Layout che si adatta al contenuto

## Funzionalità Avanzate

### Sistema di Iscrizioni
- **Iscrizione immediata**: Un click per iscriversi
- **Prevenzione duplicati**: Impossibile iscriversi due volte allo stesso PCTO
- **Stato persistente**: Le iscrizioni rimangono salvate tra le sessioni
- **Disiscrizione facile**: Possibilità di cancellarsi con un click

### Calendario Dinamico
- **Scroll infinito**: Caricamento progressivo dei mesi
- **Selezione range**: Selezione intuitiva di periodi
- **Animazioni**: Feedback visuale per le selezioni
- **Validazione date**: Controlli per evitare date non valide
