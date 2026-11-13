# PCTOxp

Sistema di gestione PCTO dell'Istituto Agnelli (SvelteKit + SQLite).

- **Studenti**: vedono i PCTO e si iscrivono (massimo 5 PCTO, nel limite dei posti disponibili).
- **Docenti**: pubblicano i PCTO, vedono gli iscritti ai propri PCTO e li possono eliminare.

## Requisiti

- Node.js 20 o superiore
- `sqlite3` (solo per gestire a mano la tabella dei docenti)
- Un Client ID OAuth di Google

## Installazione

1. Clona il repository e installa le dipendenze:

   ```bash
   git clone https://github.com/gabboshot/PCTOxp.git
   cd PCTOxp
   npm ci
   ```

2. Crea il file `.env` partendo da `.env.example` e inserisci il Client ID di Google:

   ```bash
   cp .env.example .env
   ```

   Nella Google Cloud Console, tra le *Origini JavaScript autorizzate* del Client ID va
   aggiunto l'indirizzo da cui si apre il sito (es. `http://localhost:5173` in sviluppo).
   Google non accetta indirizzi IP di rete locale: per usare il sito da smartphone serve
   un nome di dominio con HTTPS.

3. Avvia il sito:

   ```bash
   npm run dev
   ```

   e apri http://localhost:5173. Il database `data/pctoxp.db` viene creato al primo avvio.

## Accesso

L'accesso avviene **solo** con "Accedi con Google" e con un account `@istitutoagnelli.it`.
Il server verifica il token presso Google (firma, scadenza, Client ID ed email verificata).

Chi accede è uno **studente**, a meno che la sua email sia presente nella tabella `docenti`.
Gli studenti devono avere un'email nel formato `nome.cognome@istitutoagnelli.it`.

Le sessioni durano 12 ore e vengono annullate con il logout.

## Gestione dei docenti

I docenti si inseriscono a mano nel database:

```bash
# aggiungere un docente (nome e cognome sono facoltativi: se vuoti si usano quelli di Google)
sqlite3 data/pctoxp.db "INSERT INTO docenti (email, nome, cognome) VALUES ('mario.rossi@istitutoagnelli.it', 'Mario', 'Rossi');"

# elencare i docenti
sqlite3 data/pctoxp.db "SELECT id, email, nome, cognome FROM docenti;"

# rimuovere un docente (ha effetto subito, anche sulle sessioni aperte)
sqlite3 data/pctoxp.db "DELETE FROM docenti WHERE email = 'mario.rossi@istitutoagnelli.it';"
```

In alternativa, al primo avvio con la tabella vuota,
vengono importate le email elencate in `data/docenti.json` (un array JSON di stringhe).

I PCTO di un docente rimosso restano visibili e possono essere gestiti da qualunque docente.

## Struttura del progetto

- `src/lib/server/db.js`: schema del database, utenti, docenti e sessioni
- `src/routes/api/`: API (login, PCTO, iscrizioni)
- `src/routes/bacheca/`: bacheca pubblica, dello studente e del docente
- `src/routes/aggiunta-pcto/`: inserimento di nuovi PCTO (solo docenti)
- `src/lib/*.svelte`: componenti (navbar, card PCTO, calendario, pulsante Google)

La cartella `data/` contiene dati personali e non va inserita nel repository.
