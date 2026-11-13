import { json } from '@sveltejs/kit';
import { upsertGoogleProfile, createSession, validateSchoolEmail } from '$lib/server/db.js';

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export const POST = async ({ request }) => {
  const body = await request.json().catch(() => null);

  if (!body) {
    return json({ success: false, error: 'Richiesta non valida.' }, { status: 400 });
  }

  let email = '';
  let nome = '';
  let cognome = '';
  let img_profilo = null;

  if (body.credential) {
    let payload = decodeJwtPayload(body.credential);

    try {
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${body.credential}`);
      if (verifyRes.ok) {
        payload = await verifyRes.json();
      }
    } catch (e) {
    }

    if (!payload?.email) {
      return json({ success: false, error: 'Token Google non valido.' }, { status: 401 });
    }

    email = String(payload.email);
    nome = String(payload.given_name ?? payload.name ?? '');
    cognome = String(payload.family_name ?? '');

    const picture = payload.picture ?? payload.avatar_url ?? payload.photo;
    img_profilo = picture ? String(picture) : null;
  } else if (body.email) {
    email = String(body.email).trim();
    nome = String(body.nome ?? '').trim();
    cognome = String(body.cognome ?? '').trim();
    img_profilo = body.img_profilo ? String(body.img_profilo) : null;
  } else {
    return json({ success: false, error: 'Dati di accesso mancanti.' }, { status: 400 });
  }

  const schoolCheck = validateSchoolEmail(email);
  if (!schoolCheck.valid) {
    return json({ success: false, error: schoolCheck.error }, { status: 403 });
  }

  try {
    const profile = upsertGoogleProfile({
      email,
      nome: nome || schoolCheck.nome,
      cognome: cognome || schoolCheck.cognome,
      img_profilo
    });

    const token = createSession(profile.id);

    return json({
      success: true,
      token,
      profile
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore durante la registrazione del profilo.';
    return json({ success: false, error: message }, { status: 400 });
  }
};
