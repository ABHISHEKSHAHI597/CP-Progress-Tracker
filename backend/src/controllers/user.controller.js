import User from "../models/User.js";

import {
  getUserInfo,
} from "../services/codeforces.service.js";

import {
  syncUserSubmissions,
} from "../services/sync.service.js";

import {
  buildUserStats,
} from "../utils/buildUserStats.js";

/**
 * The background job already sweeps every handle on a timer. This endpoint
 * exists for the person who just solved something and wants to see it now, so
 * it costs one request for one handle and refuses to repeat itself.
 */
const COOLDOWN_MS = 60 * 1000;

const lastRefreshed = new Map();

const cooldownRemaining = (handle) => {
  const at = lastRefreshed.get(handle);

  return at ? Math.max(0, COOLDOWN_MS - (Date.now() - at)) : 0;
};

export const addUser = async (req, res) => {
  try {
    const { handle } = req.body;

    // A JSON body can hold an object where a string is expected, and an
    // object reaching a query becomes a Mongo operator — {"$ne": null} would
    // match a user that was never named. Rejecting anything but a non-empty
    // string closes that off at the edge, which is why no sanitiser runs
    // over the request globally.
    if (typeof handle !== "string" || handle.trim() === "") {
      return res.status(400).json({
        message: "Enter a Codeforces handle",
      });
    }

    // Codeforces handles ignore case, so "Tourist" is already "tourist".
    const exists = await User.findOne({
      handle: handle.trim(),
    }).collation({ locale: "en", strength: 2 });

    if (exists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const cfUser = await getUserInfo(handle.trim());

    const stats = await buildUserStats(cfUser.handle);

    const created = await User.create({
      handle: cfUser.handle,

      cfId: cfUser.id,

      rank: cfUser.rank,

      maxRank: cfUser.maxRank,

      rating: cfUser.rating,

      maxRating: cfUser.maxRating,

      contribution: cfUser.contribution,

      friendOfCount: cfUser.friendOfCount,

      registrationTime: new Date(
        cfUser.registrationTimeSeconds * 1000
      ),

      lastOnlineTime: new Date(
        cfUser.lastOnlineTimeSeconds * 1000
      ),

      ...stats,
    });

    // The sync bookkeeping is large and internal, so hand back the same shape
    // the roster endpoint returns.
    const user = await User.findById(created._id);

    res.status(201).json(user);
  } catch (error) {
    // Codeforces answers 400 for a handle it does not know.
    if (error.status === 400) {
      return res.status(404).json({
        message: "No Codeforces user with that handle",
      });
    }

    // Two adds of the same handle racing past the check above.
    if (error.code === 11000) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // The raw message can carry database or network internals, so it stays
    // in the server log.
    console.error("Add user failed:", error);

    res.status(500).json({
      message: "Could not add that handle. Try again shortly.",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    // The sync bookkeeping fields are excluded by the schema, so this returns
    // only what the site renders.
    const users = await User.find().sort({
      rating: -1,
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Roster fetch failed:", error);

    res.status(500).json({
      message: "Could not load the roster",
    });
  }
};

export const refreshUser = async (req, res) => {
  let handle;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "No tracked user with that id",
      });
    }

    const waitMs = cooldownRemaining(user.handle);

    if (waitMs > 0) {
      return res.status(429).json({
        message: `${user.handle} was just refreshed.`,
        retryAfter: Math.ceil(waitMs / 1000),
      });
    }

    handle = user.handle;
    lastRefreshed.set(handle, Date.now());

    const outcome = await syncUserSubmissions(user.handle);

    res.json({
      outcome,
      user: await User.findById(user._id),
    });
  } catch (error) {
    // Let them try again rather than sit out the cooldown for a failed call.
    if (handle) lastRefreshed.delete(handle);

    res.status(502).json({
      message: "Codeforces did not answer. Try again shortly.",
    });
  }
};

export const deleteUser = async (
  req,
  res
) => {
  try {
    // A path segment is always a string, so this cannot carry a query
    // operator, but an id that is not an ObjectId still throws.
    const removed = await User.findByIdAndDelete(
      req.params.id
    );

    if (!removed) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User removed",
    });
  } catch {
    res.status(400).json({
      message: "Invalid user id",
    });
  }
};