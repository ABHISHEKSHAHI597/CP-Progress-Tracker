import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    /**
     * Stamped into every token and checked on every request. Bumping it
     * invalidates each session already issued, which is the only way to sign
     * an admin out everywhere before their hour is up — short of changing
     * JWT_SECRET, which signs out every account at once.
     */
    tokenVersion: {
      type: Number,
      default: 0,
    },

    /**
     * Consecutive failed sign-ins, and the time the account reopens.
     *
     * The per-IP rate limiter cannot be the only brute-force defence, because
     * the address it buckets by comes from X-Forwarded-For, which the caller
     * controls: rotate that header and every attempt looks like a new visitor.
     * This counter hangs off the account instead, so it holds no matter where
     * the attempts come from.
     */
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Admin",
  adminSchema
);
