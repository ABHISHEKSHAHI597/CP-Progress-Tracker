import { ipKeyGenerator } from "express-rate-limit";

import { PROXY_SECRET } from "../config/env.js";

/** The header the Vercel middleware (frontend/middleware.js) adds. */
const HEADER = "x-client-ip";

/**
 * The address the rate limiters bucket by.
 *
 * req.ip depends on TRUST_PROXY matching the exact number of proxies between
 * Vercel and this process, and that number changes with the host: Railway
 * added one hop, Render adds its own. Guess low and every visitor shares
 * Vercel's address and one limit; guess high and the caller picks their own.
 *
 * The Vercel middleware sends the visitor's address directly instead. It
 * overwrites anything the caller sent, and with PROXY_SECRET set proxyGate has
 * already turned away every request that did not come through it, so the
 * header can be trusted without counting hops. Without the secret (local
 * development) anyone could set it, so req.ip is used as before.
 */
const clientKey = (req) => {
  const forwarded = PROXY_SECRET ? req.get(HEADER) : undefined;

  return ipKeyGenerator(forwarded || req.ip);
};

export default clientKey;
