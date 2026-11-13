import Database from "better-sqlite3";
import { resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import crypto from "node:crypto";

const SCHOOL_DOMAIN = "@istitutoagnelli.it";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 ore

const dbDir = resolve("data");
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

const db = new Database(resolve(dbDir, "pctoxp.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS studenti (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    UNIQUE NOT NULL,
    nome        TEXT    NOT NULL DEFAULT '',
    cognome     TEXT    NOT NULL DEFAULT '',
    img_profilo TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- I docenti vengono inseriti a mano: chi non è in questa tabella è uno studente.
  CREATE TABLE IF NOT EXISTS docenti (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    UNIQUE NOT NULL,
    nome        TEXT    NOT NULL DEFAULT '',
    cognome     TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pcto (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT    NOT NULL,
    description  TEXT    NOT NULL,
    start_date   TEXT    NOT NULL,
    end_date     TEXT    NOT NULL,
    start_time   TEXT    NOT NULL DEFAULT '',
    end_time     TEXT    NOT NULL DEFAULT '',
    ente         TEXT    NOT NULL DEFAULT '',
    luogo        TEXT    NOT NULL DEFAULT '',
    max_studenti INTEGER NOT NULL DEFAULT 20,
    ore          INTEGER,
    created_by   INTEGER REFERENCES docenti(id) ON DELETE SET NULL,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS iscrizioni (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    studente_id      INTEGER NOT NULL REFERENCES studenti(id) ON DELETE CASCADE,
    pcto_id          INTEGER NOT NULL REFERENCES pcto(id) ON DELETE CASCADE,
    data_iscrizione  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE (studente_id, pcto_id)
  );

  -- Si salva solo l'hash SHA-256 del token: chi legge il DB non può riusare le sessioni.
  CREATE TABLE IF NOT EXISTS sessioni (
    token_hash  TEXT    PRIMARY KEY,
    email       TEXT    NOT NULL,
    expires_at  INTEGER NOT NULL
  );
`);

// Migrazioni per i database creati con versioni precedenti dello schema.
function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
ensureColumn("docenti", "img_profilo", "TEXT"); // foto profilo presa da Google
ensureColumn("pcto", "ore", "INTEGER"); // monte ore totale del PCTO

db.prepare("DELETE FROM sessioni WHERE expires_at <= ?").run(Date.now());

// Popolamento iniziale opzionale da data/docenti.json (array di email), solo a tabella vuota.
const docentiCount = db.prepare("SELECT count(*) AS count FROM docenti").get().count;
const docentiJson = resolve(dbDir, "docenti.json");
if (docentiCount === 0 && existsSync(docentiJson)) {
  try {
    const parsed = JSON.parse(readFileSync(docentiJson, "utf-8"));
    if (Array.isArray(parsed)) {
      const stmt = db.prepare("INSERT OR IGNORE INTO docenti (email) VALUES (?)");
      for (const em of parsed) {
        if (typeof em === "string" && em.trim()) stmt.run(normalizeEmail(em));
      }
    }
  } catch (err) {
    console.error("Impossibile leggere data/docenti.json:", err);
  }
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

// ---------------------------------------------------------------- docenti

function isDocenteEmail(email) {
  return !!db.prepare("SELECT 1 FROM docenti WHERE LOWER(email) = ?").get(normalizeEmail(email));
}

// ---------------------------------------------------------------- utenti

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Controlla il dominio della scuola e ricava nome/cognome dalla parte locale
 * (nome.cognome@...). Il formato nome.cognome è obbligatorio solo per gli studenti.
 */
function validateSchoolEmail(email, { requireNomeCognome = true } = {}) {
  const normalized = normalizeEmail(email);

  if (!normalized.endsWith(SCHOOL_DOMAIN) || normalized.length === SCHOOL_DOMAIN.length) {
    return {
      valid: false,
      error: `Accesso negato: devi utilizzare un account Google della scuola (${SCHOOL_DOMAIN}).`,
    };
  }

  const parts = normalized.slice(0, -SCHOOL_DOMAIN.length).split(".").filter(Boolean);

  if (parts.length < 2) {
    if (requireNomeCognome) {
      return {
        valid: false,
        error: `Formato email non valido. Il formato deve essere nome.cognome${SCHOOL_DOMAIN}.`,
      };
    }
    return { valid: true, nome: capitalize(parts[0] ?? ""), cognome: "" };
  }

  return {
    valid: true,
    nome: capitalize(parts[0]),
    cognome: parts.slice(1).map(capitalize).join(" "),
  };
}

function toProfile(row, ruolo) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    nome: row.nome,
    cognome: row.cognome,
    img_profilo: row.img_profilo ?? null,
    // Calcolato, non salvato: docente se l'email è nella tabella docenti.
    ruolo,
  };
}

/** Cerca l'utente: prima tra i docenti, poi tra gli studenti. */
function getUserByEmail(email) {
  const normalized = normalizeEmail(email);
  const docente = db.prepare("SELECT * FROM docenti WHERE LOWER(email) = ?").get(normalized);
  if (docente) return toProfile(docente, "docente");
  const studente = db.prepare("SELECT * FROM studenti WHERE email = ?").get(normalized);
  return toProfile(studente, "studente");
}

/**
 * Registra/aggiorna l'utente dopo un login Google verificato.
 * Lancia un errore con messaggio leggibile se l'email non è ammessa.
 */
export function upsertGoogleProfile(data) {
  const email = normalizeEmail(data.email);
  const docente = isDocenteEmail(email);
  const validation = validateSchoolEmail(email, { requireNomeCognome: !docente });
  if (!validation.valid) throw new Error(validation.error);

  const nome = String(data.nome ?? "").trim() || validation.nome || "Utente";
  const cognome = String(data.cognome ?? "").trim() || validation.cognome || "";
  const img = data.img_profilo || null;

  if (docente) {
    // Nome e cognome inseriti a mano hanno la precedenza su quelli di Google.
    db.prepare(
      `UPDATE docenti
         SET nome = CASE WHEN nome = '' THEN ? ELSE nome END,
             cognome = CASE WHEN cognome = '' THEN ? ELSE cognome END,
             img_profilo = ?
       WHERE LOWER(email) = ?`,
    ).run(nome, cognome, img, email);
  } else {
    db.prepare(
      `INSERT INTO studenti (email, nome, cognome, img_profilo)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         nome = excluded.nome,
         cognome = excluded.cognome,
         img_profilo = excluded.img_profilo,
         updated_at = datetime('now')`,
    ).run(email, nome, cognome, img);
  }

  return getUserByEmail(email);
}

// ---------------------------------------------------------------- sessioni

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export function createSession(email) {
  const token = crypto.randomBytes(32).toString("base64url");
  db.prepare(
    "INSERT INTO sessioni (token_hash, email, expires_at) VALUES (?, ?, ?)",
  ).run(hashToken(token), normalizeEmail(email), Date.now() + SESSION_TTL_MS);
  return token;
}

/** Restituisce il profilo collegato al token, o null se assente/scaduto/revocato. */
function getSession(token) {
  if (typeof token !== "string" || !token) return null;
  const hash = hashToken(token);
  const row = db.prepare("SELECT email, expires_at FROM sessioni WHERE token_hash = ?").get(hash);
  if (!row) return null;
  if (row.expires_at <= Date.now()) {
    db.prepare("DELETE FROM sessioni WHERE token_hash = ?").run(hash);
    return null;
  }
  // Il ruolo viene ricalcolato a ogni richiesta: togliere un docente dalla tabella ha effetto subito.
  return getUserByEmail(row.email);
}

export function deleteSession(token) {
  if (typeof token !== "string" || !token) return;
  db.prepare("DELETE FROM sessioni WHERE token_hash = ?").run(hashToken(token));
}

export function getBearerToken(request) {
  const match = (request.headers.get("authorization") ?? "").match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : null;
}

/** Profilo dell'utente autenticato dalla richiesta, o null. */
export function getUserFromRequest(request) {
  return getSession(getBearerToken(request));
}

export default db;
