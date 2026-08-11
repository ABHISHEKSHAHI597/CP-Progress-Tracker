import cron from "node-cron";

import User from "../models/User.js";

import {
  getUserInfo,
} from "../services/codeforces.service.js";

import {
  buildUserStats,
} from "../utils/buildUserStats.js";

const refreshAllUsers = async () => {
  try {
    console.log(
      "Refreshing users..."
    );

    const users = await User.find();

    for (const user of users) {
      try {
        const cfUser =
          await getUserInfo(
            user.handle
          );

        const stats =
          await buildUserStats(
            user.handle
          );

        await User.findByIdAndUpdate(
          user._id,
          {
            rank: cfUser.rank,
            maxRank:
              cfUser.maxRank,

            rating:
              cfUser.rating,

            maxRating:
              cfUser.maxRating,

            contribution:
              cfUser.contribution,

            friendOfCount:
              cfUser.friendOfCount,

            lastOnlineTime:
              new Date(
                cfUser.lastOnlineTimeSeconds *
                  1000
              ),

            ...stats,
          }
        );

        console.log(
          `${user.handle} updated`
        );
      } catch (err) {
        console.log(
          `Failed for ${user.handle}`
        );
      }
    }

    console.log(
      "Refresh completed"
    );
  } catch (err) {
    console.log(err);
  }
};

export const startCronJob =
  async () => {
    await refreshAllUsers();

    cron.schedule(
      "*/5 * * * *",
      refreshAllUsers
    );
  };