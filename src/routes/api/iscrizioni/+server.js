import { json } from '@sveltejs/kit';
import db, { getSession } from '$lib/server/db.js';

export const GET = async ({ url, request }) => {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const profile = getSession(token);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  const studentId = Number(url.searchParams.get('studentId') ?? profile.id);

  const rows = db.prepare(
    'SELECT pcto_id FROM iscrizioni WHERE studente_id = ?'
  ).all(studentId);

  return json({ success: true, iscrizioni: rows.map((r) => r.pcto_id) });
};

export const POST = async ({ request }) => {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const profile = getSession(token);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const pctoId = Number(body?.pcto_id);
  const action = String(body?.action ?? '');

  if (!pctoId || !['iscriviti', 'disiscrivi'].includes(action)) {
    return json({ success: false, error: 'Richiesta non valida.' }, { status: 400 });
  }

  const targetPcto = db.prepare('SELECT id, title, max_studenti FROM pcto WHERE id = ?').get(pctoId);
  if (!targetPcto) {
    return json({ success: false, error: 'PCTO non trovato.' }, { status: 404 });
  }

  if (action === 'iscriviti') {
    const already = db.prepare(
      'SELECT id FROM iscrizioni WHERE pcto_id = ? AND studente_id = ?'
    ).get(pctoId, profile.id);

    if (already) {
      return json({ success: true, message: 'Sei già iscritto a questo PCTO.' });
    }

    const studentEnrollments = db.prepare(
      'SELECT count(*) as count FROM iscrizioni WHERE studente_id = ?'
    ).get(profile.id).count;

    if (studentEnrollments >= 5) {
      return json({
        success: false,
        error: 'Hai raggiunto il limite massimo di 5 PCTO a cui puoi iscriverti.'
      }, { status: 400 });
    }

    const currentEnrolledCount = db.prepare(
      'SELECT count(*) as count FROM iscrizioni WHERE pcto_id = ?'
    ).get(pctoId).count;

    const maxAllowed = targetPcto.max_studenti || 20;
    if (currentEnrolledCount >= maxAllowed) {
      return json({
        success: false,
        error: `Posti esauriti per questo PCTO (limite massimo di ${maxAllowed} studenti raggiunto).`
      }, { status: 400 });
    }

    db.prepare(
      'INSERT INTO iscrizioni (studente_id, pcto_id) VALUES (?, ?)'
    ).run(profile.id, pctoId);
  }

  if (action === 'disiscrivi') {
    db.prepare(
      'DELETE FROM iscrizioni WHERE pcto_id = ? AND studente_id = ?'
    ).run(pctoId, profile.id);
  }

  return json({ success: true });
};
