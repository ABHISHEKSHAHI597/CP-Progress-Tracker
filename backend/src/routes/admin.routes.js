import express from "express";

import { loginAdmin } from "../controllers/admin.controller.js";

import loginLimiter from "../middleware/loginLimiter.js";

const router = express.Router();

router.post(
  "/login",
  loginLimiter,
  loginAdmin
);

export default router;