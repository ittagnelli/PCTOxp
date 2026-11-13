import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { upsertGoogleProfile, createSession } from '$lib/server/db.js';

const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);

/**
 * Verifica l'ID token presso Google (firma e scadenza) e controlla che sia stato
 * emesso per la nostra applicazione e per un'email verificata.
 * Restituisce il payload oppure null: non si usa MAI il token senza verifica.
 */
async function verifyGoogleIdToken(idToken, clientId) {
  let res;
  try {
    res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?${new URLSearchParams({ id_token: idToken })}`
    );
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const payload = await res.json().catch(() => null);
  if (!payload) return null;
  if (payload.aud !== clientId) return null;
  if (!GOOGLE_ISSUERS.has(payload.iss)) return null;
  if (payload.email_verified !== true && payload.email_verified !== 'true') return null;
  if (!(Number(payload.exp) * 1000 > Date.now())) return null;
  if (typeof payload.email !== 'string' || !payload.email) return null;

  return payload;
}

export const POST = async ({ request }) => {
  const clientId = env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('GOOGLE_CLIENT_ID / VITE_GOOGLE_CLIENT_ID non configurato.');
    return json({ success: false, error: 'Login Google non configurato sul server.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const credential = body?.credential;

  if (typeof credential !== 'string' || !credential || credential.length > 4096) {
    return json({ success: false, error: 'Dati di accesso mancanti.' }, { status: 400 });
  }

  const payload = await verifyGoogleIdToken(credential, clientId);
  if (!payload) {
    return json({ success: false, error: 'Token Google non valido.' }, { status: 401 });
  }

  try {
    const profile = upsertGoogleProfile({
      email: payload.email,
      nome: payload.given_name ?? '',
      cognome: payload.family_name ?? '',
      img_profilo: typeof payload.picture === 'string' ? payload.picture : null
    });

    const token = createSession(profile.email);
    return json({ success: true, token, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore durante la registrazione del profilo.';
    return json({ success: false, error: message }, { status: 403 });
  }
};
