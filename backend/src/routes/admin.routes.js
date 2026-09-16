import express from "express";

import {
  loginAdmin,
  logoutAdmin,
  getSession,
} from "../controllers/admin.controller.js";

import loginLimiter from "../middleware/loginLimiter.js";

const router = express.Router();

router.post(
  "/login",
  loginLimiter,
  loginAdmin
);

router.post(
  "/logout",
  logoutAdmin
);

// Public on purpose: it reports whether the caller's cookie is valid and
// nothing more. See getSession.
router.get(
  "/session",
  getSession
);

export default router;
