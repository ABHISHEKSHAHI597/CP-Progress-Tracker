import rateLimit from "express-rate-limit";

/**
 * The on-demand refresh spends the shared Codeforces budget, so one visitor
 * cannot be allowed to drain it. The per-handle cooldown in the controller is
 * the finer limit; this one stops a single address from working around it by
 * cycling through every handle on the roster.
 */
const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,

  max: 12,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    message: "Too many refreshes. Wait a minute and try again.",
  },
});

export default refreshLimiter;
