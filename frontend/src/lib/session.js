/**
 * The admin session, which is one token in sessionStorage. It lasts an hour,
 * which is how long the backend signs it for, and dies with the tab.
 *
 * sessionStorage throws rather than returning null in some privacy modes, so
 * every access is guarded.
 */
const KEY = "token";

export function getToken() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    sessionStorage.setItem(KEY, token);
  } catch {
    // A session that cannot be stored simply will not persist.
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

export const isSignedIn = () => Boolean(getToken());
