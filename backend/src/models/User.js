import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    handle: {
      type: String,
      required: true,
      unique: true,
    },

    cfId: Number,

    rank: String,

    maxRank: String,

    rating: Number,

    maxRating: Number,

    contribution: Number,

    friendOfCount: Number,

    registrationTime: Date,

    lastOnlineTime: Date,

    totalSolved: {
      type: Number,
      default: 0,
    },

    solvedLast30Days: {
      type: Number,
      default: 0,
    },

    contestCount: {
      type: Number,
      default: 0,
    },

    recentSolved: [
      {
        problemName: String,
        rating: Number,
        contestId: Number,
        index: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "User",
  userSchema
);