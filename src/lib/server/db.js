import Database from "better-sqlite3";
import { resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import crypto from "node:crypto";

const dbDir = resolve("data");
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

const dbPath = resolve(dbDir, "pctoxp.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`DROP TABLE IF EXISTS sessions;`);

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
    max_studenti INTEGER NOT NULL DEFAULT 5,
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
`);

const docentiCount = db
  .prepare("SELECT count(*) as count FROM docenti")
  .get().count;
if (docentiCount === 0) {
  const jsonPath = resolve("data/docenti.json");
  let loaded = false;
  if (existsSync(jsonPath)) {
    try {
      const parsed = JSON.parse(readFileSync(jsonPath, "utf-8"));
      if (Array.isArray(parsed) && parsed.length > 0) {
        const stmt = db.prepare(
          "INSERT OR IGNORE INTO docenti (email) VALUES (?)",
        );
        for (const em of parsed) {
          if (typeof em === "string" && em.trim()) {
            stmt.run(em.trim().toLowerCase());
          }
        }
        loaded = true;
      }
    } catch {}
  }
  if (!loaded) {
    db.prepare("INSERT OR IGNORE INTO docenti (email) VALUES (?)").run(
      "gabriele.savio@istitutoagnelli.it",
    );
  }
}

export function getDocentiList() {
  try {
    const rows = db
      .prepare("SELECT email FROM docenti ORDER BY email ASC")
      .all();
    return rows.map((r) => r.email.trim().toLowerCase());
  } catch (err) {
    console.error("Errore nella lettura dei docenti:", err);
    return [];
  }
}

export function isDocenteEmail(email) {
  const normalized = email.trim().toLowerCase();
  const row = db
    .prepare("SELECT id FROM docenti WHERE LOWER(email) = ?")
    .get(normalized);
  return !!row;
}

export function addDocente(email, nome = "", cognome = "") {
  const normalized = email.trim().toLowerCase();
  db.prepare(
    "INSERT OR IGNORE INTO docenti (email, nome, cognome) VALUES (?, ?, ?)",
  ).run(normalized, nome, cognome);
}

export function removeDocente(email) {
  const normalized = email.trim().toLowerCase();
  db.prepare("DELETE FROM docenti WHERE LOWER(email) = ?").run(normalized);
}

export function validateSchoolEmail(email) {
  const normalized = email.trim().toLowerCase();

  if (!normalized.endsWith("@istitutoagnelli.it")) {
    return {
      valid: false,
      error:
        "Accesso negato: devi utilizzare un account Google della scuola (@istitutoagnelli.it).",
    };
  }

  const localPart = normalized.slice(0, -"@istitutoagnelli.it".length);
  const parts = localPart.split(".").filter(Boolean);

  if (parts.length < 2) {
    return {
      valid: false,
      error:
        "Formato email non valido. Il formato deve essere nome.cognome@istitutoagnelli.it.",
    };
  }

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const nome = capitalize(parts[0]);
  const cognome = parts.slice(1).map(capitalize).join(" ");

  return { valid: true, nome, cognome };
}

export function upsertGoogleProfile(data) {
  const email = data.email.trim().toLowerCase();
  const validation = validateSchoolEmail(email);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const nome = data.nome?.trim() || validation.nome || "Utente";
  const cognome = data.cognome?.trim() || validation.cognome || "";

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome + "+" + cognome)}&background=1976d2&color=fff&size=120&bold=true`;
  const img = data.img_profilo || fallbackAvatar;

  const existing = db
    .prepare("SELECT * FROM studenti WHERE email = ?")
    .get(email);

  if (existing) {
    db.prepare(
      `
      UPDATE studenti
      SET nome = ?, cognome = ?, img_profilo = ?, updated_at = datetime('now')
      WHERE email = ?
    `,
    ).run(nome, cognome, img, email);

    return db.prepare("SELECT * FROM studenti WHERE email = ?").get(email);
  } else {
    const res = db
      .prepare(
        `
      INSERT INTO studenti (email, nome, cognome, img_profilo)
      VALUES (?, ?, ?, ?, ?)
    `,
      )
      .run(email, nome, cognome, img);

    return db
      .prepare("SELECT * FROM prostudenti files WHERE id = ?")
      .get(res.lastInsertRowid);
  }
}

const SESSION_SECRET = "pctoxp-school-secret-key-2026";

export function createSession(userId) {
  const timestamp = Date.now().toString();
  const data = `${userId}.${timestamp}`;
  const hmac = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("hex");
  return Buffer.from(`${data}.${hmac}`).toString("base64url");
}

export function getSession(token) {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const [userIdStr, timestampStr, hmac] = raw.split(".");
    if (!userIdStr || !timestampStr || !hmac) return null;

    const data = `${userIdStr}.${timestampStr}`;
    const expected = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(data)
      .digest("hex");
    if (expected !== hmac) return null;

    const userId = Number(userIdStr);
    const profile = db
      .prepare("SELECT * FROM profiles WHERE id = ?")
      .get(userId);
    return profile ?? null;
  } catch {
    return null;
  }
}

export function deleteSession(_token) {}

export function clearAllUsers() {
  db.prepare("DELETE FROM iscrizioni").run();
  db.prepare("DELETE FROM profiles").run();
  try {
    db.prepare(
      "DELETE FROM sqlite_sequence WHERE name IN ('profiles', 'iscrizioni')",
    ).run();
  } catch {}
}

export default db;
