import rateLimit from "express-rate-limit";

import clientKey from "./clientKey.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 5,

  keyGenerator: clientKey,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    message:
      "Too many login attempts. Please try again after 15 minutes.",
  },
});

export default loginLimiter;