import { next, rewrite } from "@vercel/functions/middleware";

/**
 * Runs on Vercel, never in the browser. Forwards /api to the backend with a
 * secret header the backend checks (backend/src/middleware/proxyGate.js), so
 * the API only answers calls that came through here.
 *
 * Both values are Vercel environment variables. They must not carry the VITE_
 * prefix, which would bake them into the public bundle.
 *
 *   API_ORIGIN    the backend, e.g. https://cp-progress-tracker.onrender.com
 *   PROXY_SECRET  the same value as PROXY_SECRET on the backend
 *
 * Until both are set this steps aside, and the /api rewrite in vercel.json
 * forwards the call without the header, as it did before.
 */
export const config = {
  matcher: "/api/:path*",
};

export default function middleware(request) {
  const origin = process.env.API_ORIGIN;
  const secret = process.env.PROXY_SECRET;

  if (!origin || !secret) return next();

  const url = new URL(request.url);
  const destination = new URL(url.pathname + url.search, origin);

  const headers = new Headers(request.headers);
  headers.set("x-proxy-secret", secret);

  return rewrite(destination, {
    request: { headers },
  });
}
