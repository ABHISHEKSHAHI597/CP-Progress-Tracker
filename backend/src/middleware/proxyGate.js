import crypto from "crypto";

import { PROXY_SECRET } from "../config/env.js";

/** The header the Vercel middleware (frontend/middleware.js) adds. */
const HEADER = "x-proxy-secret";

const expected = PROXY_SECRET ? Buffer.from(PROXY_SECRET) : null;

const matches = (value) => {
  if (typeof value !== "string") return false;

  const given = Buffer.from(value);

  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
};

/**
 * Turns away API calls that did not come through the Vercel proxy.
 *
 * The rate limiters bucket by the address in X-Forwarded-For. Through Vercel
 * that address is real, because Vercel overwrites whatever the caller sent.
 * Called directly on the backend's own hostname, the caller writes it, so each
 * login attempt can claim a new address and the limiter never fills. The
 * account lockout then becomes the only brake, and anyone could trip it on
 * purpose to keep the admin signed out.
 *
 * Only Vercel knows the secret, so requiring it closes the direct route. With
 * PROXY_SECRET unset (local development, or before Vercel has it) the gate
 * stays open.
 */
const proxyGate = (req, res, next) => {
  if (!expected || matches(req.get(HEADER))) return next();

  return res.status(403).json({
    message: "Forbidden",
  });
};

export default proxyGate;
