import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";
import { JWT_SECRET } from "../config/env.js";
import { resolveAdmin } from "../middleware/auth.middleware.js";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
  sessionCookieOptions,
} from "../config/cookie.js";

/**
 * The per-IP limiter in loginLimiter.js stops the ordinary case at 5 attempts,
 * so a legitimate admin never reaches this. It only bites when someone is
 * getting past that limiter — which is possible, because it buckets by an
 * address taken from a header the caller sets. This one is tied to the
 * account, so rotating addresses does not help.
 */
const MAX_FAILED_LOGINS = 8;
const LOCKOUT_MS = 15 * 60 * 1000;

export const loginAdmin = async (
  req,
  res
) => {
  try {
    const { username, password } =
      req.body;

    // Input validation
    if (
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid input",
      });
    }

    if (
      username.trim() === "" ||
      password.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Username and password are required",
      });
    }

    const admin =
      await Admin.findOne({
        username: username.trim(),
      });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Checked before the password is compared, so a locked account costs no
    // bcrypt work and gives away nothing through how long the answer takes.
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutes = Math.ceil(
        (admin.lockedUntil - Date.now()) / 60000
      );

      return res.status(429).json({
        message: `Too many failed attempts. Try again in ${minutes} minute${
          minutes === 1 ? "" : "s"
        }.`,
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!isMatch) {
      admin.failedLoginAttempts += 1;

      if (admin.failedLoginAttempts >= MAX_FAILED_LOGINS) {
        admin.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
        admin.failedLoginAttempts = 0;
      }

      await admin.save();

      // Deliberately the same answer as an unknown username, so this never
      // becomes a way to find out which accounts exist.
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // A good password ends the streak.
    if (admin.failedLoginAttempts !== 0 || admin.lockedUntil) {
      admin.failedLoginAttempts = 0;
      admin.lockedUntil = null;

      await admin.save();
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        tokenVersion: admin.tokenVersion,
      },
      JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    // The token goes in an HttpOnly cookie rather than the response body, so
    // no script on the page can read it and nothing has to store it.
    res.cookie(SESSION_COOKIE, token, {
      ...sessionCookieOptions,
      maxAge: SESSION_MAX_AGE_MS,
    });

    return res.status(200).json({
      username: admin.username,
    });
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};

/**
 * The cookie is HttpOnly, so the browser cannot drop it on its own. Signing
 * out has to be a request.
 */
export const logoutAdmin = (req, res) => {
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions);

  return res.status(200).json({
    signedIn: false,
  });
};

/**
 * Tells the app whether the cookie it is holding is still good, because it
 * cannot look at the cookie itself. Deliberately answers 200 either way: a
 * signed-out visitor on a public page is a normal state, not an error, and a
 * 401 here would trip the client's session-expired handling on every load.
 */
export const getSession = async (req, res) => {
  const admin = await resolveAdmin(req);

  if (!admin) {
    return res.status(200).json({
      signedIn: false,
    });
  }

  return res.status(200).json({
    signedIn: true,
    username: admin.username,
  });
};
