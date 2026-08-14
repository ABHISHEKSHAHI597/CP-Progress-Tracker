import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import contestRoutes from "./routes/contest.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/health", (req,res) => {
  res.send("Backend is running")
})

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/contests",
  contestRoutes
);

app.use("/api/calendar", calendarRoutes);

export default app;