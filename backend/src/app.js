import express from "express";
import cors from "cors";

import { ALLOWED_ORIGINS, TRUST_PROXY } from "./config/env.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import contestRoutes from "./routes/contest.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import helmet from "helmet";

const app = express();

// Without this every request looks like it came from the proxy, so the rate
// limiters would put all visitors in one bucket.
app.set("trust proxy", TRUST_PROXY);

app.use(
  cors({
    // FRONTEND_URL can list several origins, so one build serves the local
    // dev server and the deployed site without editing code.
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.length === 0) return callback(null, true);

      const allowed = ALLOWED_ORIGINS.includes(origin.replace(/\/$/, ""));

      callback(allowed ? null : new Error(`Origin ${origin} is not allowed`), allowed);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(helmet());

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