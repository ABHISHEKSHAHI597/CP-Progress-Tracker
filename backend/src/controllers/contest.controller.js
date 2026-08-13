import User from "../models/User.js";

export const getContestLeaderboard = async (
  req,
  res
) => {
  try {
    const users = await User.find()
      .sort({ rating: -1 })
      .select(
        "handle rating maxRating contestCount rank"
      );

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};