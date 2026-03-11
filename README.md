# PCTOxp

Sistema di gestione PCTO.

## Requisiti

- Docker e Docker Compose
  oppure
- PHP 8.2+ e MySQL/SQLite

## Installazione con Docker

1. Clona il repository:

   ```bash
   git clone <url-repository>
   cd PCTOxp
   ```

2. Avvia i container:

   ```bash
   docker-compose up -d --build
   ```

3. Accedi all'applicazione:
   - Web: http://localhost:8080
   - phpMyAdmin: http://localhost:8081 (credenziali: root / root)

## Installazione Manuale

1. Assicurati di avere PHP e un database (MySQL o SQLite) configurati.
2. Installa le dipendenze di Composer nella cartella login:
   ```bash
   cd login
   composer install
   ```
3. Configura il file `db.php` o le variabili d'ambiente.

## Configurazione Docenti

I docenti non vengono salvati nel database. Per aggiungere o rimuovere docenti, è necessario modificare il dizionario nel file `docenti.php`.
L'accesso per i docenti è consentito **esclusivamente** tramite il pulsante "Accedi con Google". L'email Google utilizzata per l'accesso deve corrispondere a una di quelle presenti in `docenti.php`.

Esempio di aggiunta in `docenti.php`:
```php
$docenti_autorizzati = [
    'docente@istitutoagnelli.it' => [
        'nome' => 'NomeDocente',
        'cognome' => 'CognomeDocente',
        'Img_profilo' => ''
    ]
];
```

## Struttura del Progetto

- `docenti.php`: Array di configurazione per i docenti autorizzati
- `login/`: Gestione autenticazione (Google Login)
- `bacheca/`: Visualizzazione annunci
- `aggiunta_pcto/`: Inserimento nuovi percorsi
- `apache/`: Configurazione web server
