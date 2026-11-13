import { json } from '@sveltejs/kit';
import db, { getSession } from '$lib/server/db.js';

export const GET = async ({ request }) => {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const profile = getSession(token);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  const pctoList = db.prepare('SELECT id, created_by FROM pcto').all();

  const studentiRows = db.prepare(`
    SELECT i.pcto_id, i.studente_id, p.nome, p.cognome, p.email
    FROM iscrizioni i
    JOIN profiles p ON p.id = i.studente_id
  `).all();

  const grouped = pctoList.map((pcto) => {
    const isOwner = pcto.created_by === profile.id || pcto.created_by === null;

    const allStudents = studentiRows.filter((s) => s.pcto_id === pcto.id);

    const studentNames = isOwner
      ? allStudents.map((s) => `${s.nome} ${s.cognome}`.trim() || s.email)
      : [];

    return {
      pcto_id: pcto.id,
      created_by: pcto.created_by,
      is_owner: isOwner,
      num_iscritti: allStudents.length,
      studenti_iscritti: studentNames
    };
  });

  return json({ success: true, data: grouped });
};
