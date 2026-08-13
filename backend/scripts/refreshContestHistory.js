import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../src/models/User.js";
import { buildUserStats } from "../src/utils/buildUserStats.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

try {
  const users = await User.find();

  console.log(
    `Found ${users.length} users`
  );

  for (const user of users) {
    console.log(
      `Updating ${user.handle}...`
    );

    const stats =
      await buildUserStats(
        user.handle
      );

    await User.findByIdAndUpdate(
      user._id,
      {
        totalSolved:
          stats.totalSolved,

        solvedLast30Days:
          stats.solvedLast30Days,

        contestCount:
          stats.contestCount,

        recentSolved:
          stats.recentSolved,

        contestHistory:
          stats.contestHistory,
      }
    );

    console.log(
      `✓ Updated ${user.handle}`
    );
  }

  console.log(
    "\nAll users refreshed successfully"
  );
} catch (error) {
  console.error(error);
} finally {
  await mongoose.disconnect();
  process.exit();
}