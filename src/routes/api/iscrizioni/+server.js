import { json } from '@sveltejs/kit';
import db, { getUserFromRequest } from '$lib/server/db.js';
import { toInputDate } from '$lib/format.js';

const MAX_ISCRIZIONI_STUDENTE = 5;

/** Iscrizioni dello studente autenticato (solo le proprie). */
export const GET = async ({ request }) => {
  const profile = getUserFromRequest(request);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  if (profile.ruolo !== 'studente') {
    return json({ success: true, iscrizioni: [] });
  }

  const rows = db
    .prepare('SELECT pcto_id FROM iscrizioni WHERE studente_id = ?')
    .all(profile.id);

  return json({ success: true, iscrizioni: rows.map((r) => r.pcto_id) });
};

class IscrizioneError extends Error {}

// Tutti i controlli e l'inserimento avvengono in un'unica transazione.
const iscrivi = db.transaction((studenteId, pcto) => {
  const already = db
    .prepare('SELECT 1 FROM iscrizioni WHERE pcto_id = ? AND studente_id = ?')
    .get(pcto.id, studenteId);
  if (already) return 'Sei già iscritto a questo PCTO.';

  const studentEnrollments = db
    .prepare('SELECT count(*) AS count FROM iscrizioni WHERE studente_id = ?')
    .get(studenteId).count;
  if (studentEnrollments >= MAX_ISCRIZIONI_STUDENTE) {
    throw new IscrizioneError(
      `Hai raggiunto il limite massimo di ${MAX_ISCRIZIONI_STUDENTE} PCTO a cui puoi iscriverti.`
    );
  }

  const enrolled = db
    .prepare('SELECT count(*) AS count FROM iscrizioni WHERE pcto_id = ?')
    .get(pcto.id).count;
  if (enrolled >= pcto.max_studenti) {
    throw new IscrizioneError(
      `Posti esauriti per questo PCTO (limite massimo di ${pcto.max_studenti} studenti raggiunto).`
    );
  }

  db.prepare('INSERT INTO iscrizioni (studente_id, pcto_id) VALUES (?, ?)').run(studenteId, pcto.id);
  return null;
});

export const POST = async ({ request }) => {
  const profile = getUserFromRequest(request);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  if (profile.ruolo !== 'studente') {
    return json({ success: false, error: 'Solo gli studenti possono iscriversi ai PCTO.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const pctoId = Number(body?.pcto_id);
  const action = String(body?.action ?? '');

  if (!Number.isInteger(pctoId) || pctoId <= 0 || !['iscriviti', 'disiscrivi'].includes(action)) {
    return json({ success: false, error: 'Richiesta non valida.' }, { status: 400 });
  }

  const pcto = db
    .prepare('SELECT id, max_studenti, end_date FROM pcto WHERE id = ?')
    .get(pctoId);
  if (!pcto) {
    return json({ success: false, error: 'PCTO non trovato.' }, { status: 404 });
  }

  if (pcto.end_date < toInputDate(new Date())) {
    return json({ success: false, error: 'Questo PCTO è già concluso.' }, { status: 400 });
  }

  if (action === 'iscriviti') {
    try {
      const message = iscrivi(profile.id, pcto);
      return json(message ? { success: true, message } : { success: true });
    } catch (err) {
      if (err instanceof IscrizioneError) {
        return json({ success: false, error: err.message }, { status: 400 });
      }
      throw err;
    }
  }

  db.prepare('DELETE FROM iscrizioni WHERE pcto_id = ? AND studente_id = ?').run(pctoId, profile.id);
  return json({ success: true });
};
