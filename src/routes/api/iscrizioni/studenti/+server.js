import { json } from '@sveltejs/kit';
import db, { getUserFromRequest } from '$lib/server/db.js';

/** Iscritti per ogni PCTO: i nomi sono visibili solo al docente che ha creato il PCTO. */
export const GET = async ({ request }) => {
  const profile = getUserFromRequest(request);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  if (profile.ruolo !== 'docente') {
    return json({ success: false, error: 'Riservato ai docenti.' }, { status: 403 });
  }

  const pctoList = db.prepare('SELECT id, created_by FROM pcto').all();

  const studentiRows = db.prepare(`
    SELECT i.pcto_id, s.nome, s.cognome, s.email
    FROM iscrizioni i
    JOIN studenti s ON s.id = i.studente_id
    ORDER BY s.cognome, s.nome
  `).all();

  const grouped = pctoList.map((pcto) => {
    // PCTO senza creatore (docente rimosso): gestibile da qualunque docente,
    // altrimenti resterebbe impossibile da eliminare.
    const isOwner = pcto.created_by === profile.id || pcto.created_by === null;
    const allStudents = studentiRows.filter((s) => s.pcto_id === pcto.id);

    return {
      pcto_id: pcto.id,
      created_by: pcto.created_by,
      is_owner: isOwner,
      num_iscritti: allStudents.length,
      studenti_iscritti: isOwner
        ? allStudents.map((s) => `${s.nome} ${s.cognome}`.trim() || s.email)
        : []
    };
  });

  return json({ success: true, data: grouped });
};
