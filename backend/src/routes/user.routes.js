import express from "express";

import {
  addUser,
  getUsers,
  deleteUser,
  refreshUser,
} from "../controllers/user.controller.js";

import {
  protectAdmin,
} from "../middleware/auth.middleware.js";

import refreshLimiter from "../middleware/refreshLimiter.js";

const router = express.Router();

router.get("/", getUsers);

router.post(
  "/",
  protectAdmin,
  addUser
);

router.post(
  "/:id/refresh",
  refreshLimiter,
  refreshUser
);

router.delete(
  "/:id",
  protectAdmin,
  deleteUser
);

export default router;