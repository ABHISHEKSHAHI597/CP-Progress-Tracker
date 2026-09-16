import { NODE_ENV } from "./env.js";

/** The admin session cookie. Never readable from JavaScript. */
export const SESSION_COOKIE = "admin_session";

/** Matches the JWT lifetime, so the cookie and the token expire together. */
export const SESSION_MAX_AGE_MS = 60 * 60 * 1000;

/**
 * The browser only ever talks to its own origin: the app calls /api and a
 * proxy forwards it to this server (a Vercel rewrite in production, the Vite
 * dev server locally). That makes every API call same-site, which is what lets
 * SameSite=Strict work here — it rules out CSRF without a CSRF token, because
 * the browser refuses to attach the cookie to a request from anyone else's
 * page before it is ever sent.
 *
 * Do not swap this for an Origin header check. The Vercel rewrite is a
 * server-to-server hop and sends no Origin at all, so such a check would have
 * to treat a missing Origin as trusted, which defeats it.
 *
 * Path keeps the cookie off static asset requests; it is only sent to the API.
 * Secure is off in development because localhost is plain http.
 */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
  path: "/api",
};
