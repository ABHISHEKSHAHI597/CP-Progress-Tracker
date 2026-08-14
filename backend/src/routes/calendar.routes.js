import express from "express";
import {
  getContestCalendar,
} from "../controllers/calendar.controller.js";

const router = express.Router();

router.get("/", getContestCalendar);

export default router;