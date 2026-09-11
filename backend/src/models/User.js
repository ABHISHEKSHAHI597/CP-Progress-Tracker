import mongoose from "mongoose";

const recentSolvedSchema = new mongoose.Schema(
  {
    problemName: String,
    rating: Number,
    contestId: Number,
    index: String,
  },
  { _id: false }
);

const contestHistorySchema = new mongoose.Schema(
  {
    contestId: Number,
    contestName: String,
    rank: Number,
    oldRating: Number,
    newRating: Number,
    ratingChange: Number,
    contestTime: Date,
  },
  { _id: false }
);

/** One accepted submission inside the rolling window. */
const windowSolveSchema = new mongoose.Schema(
  {
    id: Number,
    key: String,
    at: Date,
    rating: Number,
  },
  { _id: false }
);

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

    /** Distinct rated problems in the window. This is what the score uses. */
    ratedSolvedLast30Days: {
      type: Number,
      default: 0,
    },

    contestCount: {
      type: Number,
      default: 0,
    },

    recentSolved: [recentSolvedSchema],

    contestHistory: [contestHistorySchema],

    contestsLast30Days: {
      type: Number,
      default: 0,
    },

    avgProblemRating30Days: {
      type: Number,
      default: 0,
    },

    medianProblemRating30Days: {
      type: Number,
      default: 0,
    },

    // ---- Sync bookkeeping -------------------------------------------------
    // These back the incremental refresh and are far larger than anything the
    // site displays, so they are excluded from queries unless asked for.

    /** Every distinct problem ever solved, as "contestId-index". */
    solvedKeys: {
      type: [String],
      default: undefined,
      select: false,
    },

    /** Accepted submissions recent enough to matter to the 30-day figures. */
    windowSolves: {
      type: [windowSolveSchema],
      default: undefined,
      select: false,
    },

    /** Highest submission id seen, accepted or not. */
    lastSubmissionId: {
      type: Number,
      select: false,
    },

    submissionsSyncedAt: {
      type: Date,
      select: false,
    },

    fullResyncAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
