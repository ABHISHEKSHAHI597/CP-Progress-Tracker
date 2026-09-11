/**
 * Full rebuild of every tracked handle from complete Codeforces history.
 *
 * The incremental sync trusts a watermark, so it can only correct figures for
 * submissions it has not seen yet. Anything already stored keeps whatever the
 * old derivation produced. This walks each handle's entire history again and
 * rewrites the stats from scratch.
 *
 * Run it after changing how any window figure is derived.
 *
 *   node scripts/resync.mjs
 */
import mongoose from "mongoose";

import { MONGODB_URI } from "../src/config/env.js";
import User from "../src/models/User.js";
import { syncProfiles } from "../src/services/sync.service.js";
import { buildUserStats } from "../src/utils/buildUserStats.js";

const FIELDS = "handle solvedLast30Days ratedSolvedLast30Days avgProblemRating30Days medianProblemRating30Days contestsLast30Days";

const before = (user) => ({
  solved: user.solvedLast30Days ?? 0,
  rated: user.ratedSolvedLast30Days ?? 0,
  avg: user.avgProblemRating30Days ?? 0,
  med: user.medianProblemRating30Days ?? 0,
});

await mongoose.connect(MONGODB_URI);
console.log(`connected to ${mongoose.connection.name}\n`);

// Ratings feed the score directly, and one request covers the whole roster.
const profiles = await syncProfiles();
console.log(`profiles refreshed: ${profiles.checked} checked`);
if (profiles.missing.length) {
  console.log(`NOT ON CODEFORCES: ${profiles.missing.join(", ")}`);
}
console.log();

const users = await User.find({}, FIELDS).sort({ handle: 1 });
console.log(`rebuilding ${users.length} handles, about 4s each\n`);
console.log("handle                solved30      avg           median        rated30");

let done = 0;
const failed = [];

for (const user of users) {
  const was = before(user);

  try {
    const stats = await buildUserStats(user.handle);
    await User.updateOne({ _id: user._id }, { $set: stats });

    const shift = (a, b) => (a === b ? String(b).padEnd(13) : `${a}->${b}`.padEnd(13));

    console.log(
      user.handle.padEnd(21),
      shift(was.solved, stats.solvedLast30Days),
      shift(was.avg, stats.avgProblemRating30Days),
      shift(was.med, stats.medianProblemRating30Days),
      `${was.rated}->${stats.ratedSolvedLast30Days}`
    );

    done += 1;
  } catch (error) {
    failed.push(`${user.handle}: ${error.message}`);
    console.log(`${user.handle.padEnd(21)} FAILED  ${error.message}`);
  }
}

console.log(`\nrebuilt ${done} of ${users.length}`);
if (failed.length) console.log("failures:\n  " + failed.join("\n  "));

await mongoose.disconnect();
