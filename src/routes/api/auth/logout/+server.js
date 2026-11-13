import { json } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/db.js';

export const POST = async ({ request }) => {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (token) deleteSession(token);
  return json({ success: true });
};

