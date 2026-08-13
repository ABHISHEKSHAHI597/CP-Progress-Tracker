import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import contestRoutes from "./routes/contest.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

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

export default app;