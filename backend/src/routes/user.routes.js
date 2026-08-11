import express from "express";

import {
  addUser,
  getUsers,
  deleteUser,
} from "../controllers/user.controller.js";

import {
  protectAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getUsers);

router.post(
  "/",
  protectAdmin,
  addUser
);

router.delete(
  "/:id",
  protectAdmin,
  deleteUser
);

export default router;