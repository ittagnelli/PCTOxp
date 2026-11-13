import { json } from '@sveltejs/kit';
import db, { getSession } from '$lib/server/db.js';

export const DELETE = async ({ params, request }) => {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const profile = getSession(token);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  if (profile.ruolo !== 'docente') {
    return json({ success: false, error: 'Solo i docenti possono eliminare PCTO.' }, { status: 403 });
  }

  const id = Number(params.id);
  const target = db.prepare('SELECT id, created_by FROM pcto WHERE id = ?').get(id);

  if (!target) {
    return json({ success: false, error: 'PCTO non trovato.' }, { status: 404 });
  }

  if (target.created_by && target.created_by !== profile.id) {
    return json({ success: false, error: 'Puoi eliminare soltanto i PCTO inseriti da te.' }, { status: 403 });
  }

  db.prepare('DELETE FROM iscrizioni WHERE pcto_id = ?').run(id);
  db.prepare('DELETE FROM pcto WHERE id = ?').run(id);

  return json({ success: true });
};
