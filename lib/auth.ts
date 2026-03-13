// lib/auth.ts — client-side JWT header helpers

export interface Session {
  token: string;
  doctorId: string;
  name: string;
  hospitalName: string;
  email: string;
}

const SESSION_KEY = 'mammo_session';

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Returns Authorization header object for axios or fetch */
export function authHeaders(): { Authorization: string } | Record<string, never> {
  const s = getSession();
  if (!s?.token) return {};
  return { Authorization: `Bearer ${s.token}` };
}
