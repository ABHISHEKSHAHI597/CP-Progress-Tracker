import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Environment files, highest precedence first:
 *
 *   .env.<mode>.local   machine-only overrides for one mode
 *   .env.<mode>         settings for development or production
 *   .env                shared secrets (connection string, JWT key)
 *
 * dotenv never overwrites a variable that is already set, so the first
 * file to define a value wins — and anything exported by the shell or by
 * the hosting platform beats all of them.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

const mode = process.env.NODE_ENV || "development";

[`.env.${mode}.local`, `.env.${mode}`, ".env"].forEach((file) => {
  dotenv.config({ path: path.join(root, file), quiet: true });
});

export const NODE_ENV = mode;
export const PORT = Number(process.env.PORT) || 5000;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;

/**
 * How many proxies sit in front of the app, so express-rate-limit can tell one
 * visitor from another. Vercel forwards to Railway, and Railway forwards to
 * here, which is two. Get this wrong and every visitor shares one rate limit.
 */
export const TRUST_PROXY = Number(process.env.TRUST_PROXY ?? 2);

/**
 * Shared with the Vercel middleware, which adds it to every forwarded API call.
 * When set, the API refuses requests that lack it. See middleware/proxyGate.js.
 */
export const PROXY_SECRET = process.env.PROXY_SECRET || "";

/** FRONTEND_URL may list several origins, separated by commas. */
export const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

/**
 * FRONTEND_URL is only optional in development. In production an empty
 * allowlist would once have let CORS accept every origin, and because the site
 * reaches the API through a rewrite that sends no Origin at all, nothing about
 * normal use would have looked wrong. Refusing to boot is the one signal that
 * cannot be missed.
 */
const required = ["MONGODB_URI", "JWT_SECRET"];

if (mode === "production") required.push("FRONTEND_URL");

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(
    `Missing ${missing.join(" and ")} in backend/.env — see ENV.md for what each value should be.`
  );
  process.exit(1);
}

if (mode === "production" && !PROXY_SECRET) {
  console.warn(
    "PROXY_SECRET is not set, so the API answers anyone who calls it directly and the login rate limit can be bypassed."
  );
}
