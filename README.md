# PCTOxp

Sistema di gestione PCTO.

## Requisiti

-Svelte e SvelteKit

## Installazione
1.Installa SQLite se non lo hai già installato.

    ```bash
    sqlite3 --version
    sudo apt-get install sqlite3
    ```

2. Clona il repository:

   ```bash
   git clone https://github.com/gabboshot/PCTOxp.git
   cd PCTOxp
   ```

3. Installa le librerie e fai partire il sito:

   ```bash
   npm ci
   npm run dev
   ```

4. Accedi all'applicazione:
   - Web: http://localhost:5173

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