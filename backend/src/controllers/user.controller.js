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

    const exists = await User.findOne({
      handle,
    });

    if (exists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const cfUser = await getUserInfo(handle);

    const stats = await buildUserStats(handle);

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
    res.status(500).json({
      message: error.message,
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
    res.status(500).json({
      message: error.message,
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
  await User.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message: "User removed",
  });
};