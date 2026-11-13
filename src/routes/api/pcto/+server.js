import { json } from '@sveltejs/kit';
import db, { getSession } from '$lib/server/db.js';

export const GET = async () => {
  const rows = db.prepare(`
    SELECT p.*,
           COALESCE(pr.nome || ' ' || pr.cognome, pr.email, 'Docente Istituto Agnelli') AS docente_nome,
           pr.email AS docente_email,
           (SELECT COUNT(*) FROM iscrizioni i WHERE i.pcto_id = p.id) AS num_iscritti
    FROM pcto p
    LEFT JOIN studenti pr ON p.created_by = pr.id
    ORDER BY p.start_date ASC
  `).all();
  return json(rows);
};

export const POST = async ({ request }) => {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const profile = getSession(token);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  if (profile.ruolo !== 'docente') {
    return json({ success: false, error: 'Solo i docenti possono creare PCTO.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);

  const title = String(body?.title ?? '').trim();
  const description = String(body?.description ?? '').trim();
  const startDate = String(body?.start_date ?? '');
  const endDate = String(body?.end_date ?? '');
  const ente = String(body?.ente ?? '').trim();
  const luogo = String(body?.luogo ?? '').trim();
  const maxStudenti = Math.max(1, parseInt(body?.max_studenti, 10) || 20);

  if (!title || !description || !startDate || !endDate || !ente || !luogo) {
    return json({ success: false, error: 'Compila tutti i campi obbligatori (Titolo, Ente, Luogo, Date, Descrizione).' }, { status: 400 });
  }

  const startTime = String(body?.start_time ?? '08:30').trim();
  const endTime = String(body?.end_time ?? '12:30').trim();

  const result = db.prepare(`
    INSERT INTO pcto (title, description, start_date, end_date, start_time, end_time, ente, luogo, max_studenti, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
    ente,
    luogo,
    maxStudenti,
    profile.id
  );

  const pcto = db.prepare(`
    SELECT p.*,
           COALESCE(pr.nome || ' ' || pr.cognome, pr.email, 'Docente Istituto Agnelli') AS docente_nome,
           pr.email AS docente_email,
           0 AS num_iscritti
    FROM pcto p
    LEFT JOIN studenti pr ON p.created_by = pr.id
    WHERE p.id = ?
  `).get(result.lastInsertRowid);

  return json({ success: true, pcto });
};
