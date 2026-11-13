import { json } from '@sveltejs/kit';
import db, { getUserFromRequest } from '$lib/server/db.js';

export const DELETE = async ({ params, request }) => {
  const profile = getUserFromRequest(request);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  if (profile.ruolo !== 'docente') {
    return json({ success: false, error: 'Solo i docenti possono eliminare PCTO.' }, { status: 403 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ success: false, error: 'Richiesta non valida.' }, { status: 400 });
  }

  const target = db.prepare('SELECT id, created_by FROM pcto WHERE id = ?').get(id);

  if (!target) {
    return json({ success: false, error: 'PCTO non trovato.' }, { status: 404 });
  }

  // created_by NULL = docente creatore rimosso: lo può gestire qualunque docente.
  if (target.created_by !== null && target.created_by !== profile.id) {
    return json({ success: false, error: 'Puoi eliminare soltanto i PCTO inseriti da te.' }, { status: 403 });
  }

  // Le iscrizioni vengono eliminate da ON DELETE CASCADE.
  db.prepare('DELETE FROM pcto WHERE id = ?').run(id);

  return json({ success: true });
};
