import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../src/models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

await User.updateMany(
  {
    contestHistory: {
      $exists: false,
    },
  },
  {
    $set: {
      contestHistory: [],
    },
  }
);

console.log("Updated");

process.exit();