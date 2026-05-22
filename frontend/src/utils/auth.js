/* ═══════════════════════════════════════════════════════
   auth.js — JWT token storage & decode helpers
   Storage: localStorage (access + refresh tokens)
═══════════════════════════════════════════════════════ */

const ACCESS_KEY  = "ko_access";
const REFRESH_KEY = "ko_refresh";
const USER_KEY    = "ko_user";

/* ─── Token storage ─── */

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ access, refresh }) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

/* ─── User cache ─── */

export function getCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearCachedUser() {
  localStorage.removeItem(USER_KEY);
}

/* ─── JWT decode (no library needed) ─── */

export function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  // 30-second buffer
  return decoded.exp * 1000 < Date.now() + 30_000;
}

export function isAccessTokenValid() {
  const token = getAccessToken();
  return !!token && !isTokenExpired(token);
}

export function isRefreshTokenValid() {
  const token = getRefreshToken();
  return !!token && !isTokenExpired(token);
}

/* ─── Auth state helpers ─── */

export function isAuthenticated() {
  return isAccessTokenValid() || isRefreshTokenValid();
}

export function getAuthHeader() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}