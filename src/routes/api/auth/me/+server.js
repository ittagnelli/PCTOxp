import { json } from '@sveltejs/kit';
import { getSession } from '$lib/server/db.js';

export const GET = async ({ request }) => {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const profile = getSession(token);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  return json({
    success: true,
    profile: { ...profile, password: undefined }
  });
};

