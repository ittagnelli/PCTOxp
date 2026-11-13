import { json } from '@sveltejs/kit';
import { getUserFromRequest } from '$lib/server/db.js';

export const GET = async ({ request }) => {
  const profile = getUserFromRequest(request);

  if (!profile) {
    return json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  return json({ success: true, profile });
};
