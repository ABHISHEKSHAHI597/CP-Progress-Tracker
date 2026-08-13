import express from "express";

import {
  getContestLeaderboard,
} from "../controllers/contest.controller.js";

const router = express.Router();

router.get(
  "/leaderboard",
  getContestLeaderboard
);

export default router;