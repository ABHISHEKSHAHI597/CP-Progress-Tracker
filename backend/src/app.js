import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { ALLOWED_ORIGINS, NODE_ENV, TRUST_PROXY } from "./config/env.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import contestRoutes from "./routes/contest.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import helmet from "helmet";
import proxyGate from "./middleware/proxyGate.js";

const app = express();

// Without this every request looks like it came from the proxy, so the rate
// limiters would put all visitors in one bucket.
app.set("trust proxy", TRUST_PROXY);

// First, so every response carries the headers and drops X-Powered-By —
// including the ones CORS turns away below.
app.use(helmet());

app.use(
  cors({
    // FRONTEND_URL can list several origins, so one build serves the local
    // dev server and the deployed site without editing code.
    origin(origin, callback) {
      // Same-origin calls and the Vercel rewrite, which is a server-to-server
      // hop, carry no Origin header. CORS does not apply to either.
      if (!origin) return callback(null, true);

      // An empty allowlist used to mean "allow everyone", which failed open
      // silently whenever FRONTEND_URL was missing. In production that is now
      // a boot failure (see config/env.js); in development it stays open so a
      // local setup works without configuring anything.
      if (ALLOWED_ORIGINS.length === 0) {
        return callback(null, NODE_ENV !== "production");
      }

      const allowed = ALLOWED_ORIGINS.includes(origin.replace(/\/$/, ""));

      callback(allowed ? null : new Error(`Origin ${origin} is not allowed`), allowed);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Every body this API accepts is a handle or a username and password.
app.use(express.json({ limit: "10kb" }));

// The admin session travels as an HttpOnly cookie, so it has to be parsed
// before any route that reads it.
app.use(cookieParser());

app.get("/health", (req,res) => {
  res.send("Backend is running")
})

// /health stays outside the gate so the host's health check can reach it.
app.use("/api", proxyGate);

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

// Anything unhandled lands here instead of Express's default page, which
// prints the stack trace whenever NODE_ENV is not "production". A refused
// origin is the caller's fault, so it answers 403 rather than 500.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error.message?.startsWith("Origin ")) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (error.type === "entity.too.large" || error.type === "entity.parse.failed") {
    return res.status(error.status).json({ message: "Invalid request body" });
  }

  console.error("Unhandled error:", error);

  res.status(500).json({ message: "Internal server error" });
});

export default app;
