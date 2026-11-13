import { json } from '@sveltejs/kit';
import { deleteSession, getBearerToken } from '$lib/server/db.js';

export const POST = async ({ request }) => {
  deleteSession(getBearerToken(request));
  return json({ success: true });
};
