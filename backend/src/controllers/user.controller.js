import User from "../models/User.js";

import {
  getUserInfo,
} from "../services/codeforces.service.js";

import {
  buildUserStats,
} from "../utils/buildUserStats.js";

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

    const user = await User.create({
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

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
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