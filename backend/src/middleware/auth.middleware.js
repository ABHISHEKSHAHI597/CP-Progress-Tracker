import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";
import { JWT_SECRET } from "../config/env.js";
import { SESSION_COOKIE } from "../config/cookie.js";

/**
 * Reads the session cookie and returns the admin it belongs to, or null.
 *
 * The algorithm is pinned so a token can only ever be verified the way it was
 * signed, and tokenVersion is compared against the database so a session can
 * be revoked before it expires on its own.
 */
export const resolveAdmin = async (req) => {
  const token = req.cookies?.[SESSION_COOKIE];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const admin = await Admin.findById(decoded.adminId).select(
      "_id username tokenVersion"
    );

    if (!admin || admin.tokenVersion !== decoded.tokenVersion) return null;

    return {
      adminId: admin._id.toString(),
      username: admin.username,
    };
  } catch {
    // Expired, tampered with, or an id that is not an ObjectId.
    return null;
  }
};

export const protectAdmin = async (req, res, next) => {
  const admin = await resolveAdmin(req);

  if (!admin) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  req.admin = admin;

  next();
};
