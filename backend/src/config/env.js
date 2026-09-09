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

/** FRONTEND_URL may list several origins, separated by commas. */
export const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const missing = ["MONGODB_URI", "JWT_SECRET"].filter((key) => !process.env[key]);

if (missing.length) {
  console.error(
    `Missing ${missing.join(" and ")} in backend/.env — see ENV.md for what each value should be.`
  );
  process.exit(1);
}
