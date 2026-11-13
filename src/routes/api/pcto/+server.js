import { json } from '@sveltejs/kit';
import db, { getUserFromRequest } from '$lib/server/db.js';

const SELECT_PCTO = `
  SELECT p.*,
         COALESCE(NULLIF(TRIM(d.nome || ' ' || d.cognome), ''), d.email, 'Docente Istituto Agnelli') AS docente_nome,
         d.email AS docente_email,
         (SELECT COUNT(*) FROM iscrizioni i WHERE i.pcto_id = p.id) AS num_iscritti
  FROM pcto p
  LEFT JOIN docenti d ON p.created_by = d.id
`;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidDate(value) {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

const text = (value, max) => String(value ?? '').trim().slice(0, max);

export const GET = async () => {
  const rows = db.prepare(`${SELECT_PCTO} ORDER BY p.start_date ASC`).all();
  return json(rows);
};

export const POST = async ({ request }) => {
  const profile = getUserFromRequest(request);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  if (profile.ruolo !== 'docente') {
    return json({ success: false, error: 'Solo i docenti possono creare PCTO.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);

  const title = text(body?.title, 200);
  const description = text(body?.description, 5000);
  const ente = text(body?.ente, 200);
  const luogo = text(body?.luogo, 200);
  const startDate = String(body?.start_date ?? '');
  const endDate = String(body?.end_date ?? '');
  const startTime = String(body?.start_time || '08:30').trim();
  const endTime = String(body?.end_time || '12:30').trim();
  const maxStudenti = parseInt(body?.max_studenti, 10);
  const ore = Number(body?.ore);

  if (!title || !description || !startDate || !endDate || !ente || !luogo) {
    return json({ success: false, error: 'Compila tutti i campi obbligatori (Titolo, Ente, Luogo, Date, Descrizione).' }, { status: 400 });
  }

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return json({ success: false, error: 'Date non valide (formato atteso AAAA-MM-GG).' }, { status: 400 });
  }

  if (endDate < startDate) {
    return json({ success: false, error: 'La data di fine non può precedere la data di inizio.' }, { status: 400 });
  }

  if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
    return json({ success: false, error: 'Orari non validi (formato atteso HH:MM).' }, { status: 400 });
  }

  if (endTime <= startTime) {
    return json({ success: false, error: "L'ora di fine deve essere successiva all'ora di inizio." }, { status: 400 });
  }

  if (!Number.isInteger(maxStudenti) || maxStudenti < 1 || maxStudenti > 500) {
    return json({ success: false, error: 'Il limite studenti deve essere un numero tra 1 e 500.' }, { status: 400 });
  }

  if (!Number.isInteger(ore) || ore < 1 || ore > 2000) {
    return json({ success: false, error: 'Il numero di ore deve essere un intero tra 1 e 2000.' }, { status: 400 });
  }

  const result = db.prepare(`
    INSERT INTO pcto (title, description, start_date, end_date, start_time, end_time, ente, luogo, max_studenti, ore, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description, startDate, endDate, startTime, endTime, ente, luogo, maxStudenti, ore, profile.id);

  const pcto = db.prepare(`${SELECT_PCTO} WHERE p.id = ?`).get(result.lastInsertRowid);

  return json({ success: true, pcto });
};
