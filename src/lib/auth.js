const TOKEN_KEY = 'pctoxp_token';

export const fallbackImage = '/assets/logo/blue-profile-icon-free-png.webp';

export function getToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginWithGoogleCredential(credential) {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? 'Errore durante il login Google.');
  setToken(data.token);
  return data.profile;
}

export async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: authHeaders()
  }).catch(() => {});
  clearToken();
}

export async function getProfile() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch('/api/auth/me', {
    headers: authHeaders()
  });
  const data = await res.json();
  if (!data.success) {
    clearToken();
    return null;
  }
  return data.profile;
}
