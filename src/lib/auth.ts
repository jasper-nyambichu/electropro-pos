// ─── Constants ────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'electropro_token';
const USER_KEY = 'electropro_user';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  email: string;
  firstname: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  token: string;
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'electropro_token=; path=/; max-age=0';
}

// ─── User helpers ─────────────────────────────────────────────────────────────

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// ─── Authorised fetch headers ─────────────────────────────────────────────────

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

export function hasRole(...roles: AuthUser['role'][]): boolean {
  const user = getUser();
  if (!user) return false;
  return roles.includes(user.role);
}

export function isAdmin(): boolean {
  return hasRole('ADMIN');
}

export function isManagerOrAbove(): boolean {
  return hasRole('ADMIN', 'MANAGER');
}