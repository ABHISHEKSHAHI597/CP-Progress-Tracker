import {
  getUserStatus,
  getUserRatingHistory,
} from "../services/codeforces.service.js";

export const buildUserStats =
  async (handle) => {
    const submissions =
      await getUserStatus(handle);

    const contests =
      await getUserRatingHistory(
        handle
      );

    const solvedSet = new Set();

    const recentSet = new Set();

    const accepted = [];

    const thirtyDaysAgo =
      Date.now() -
      30 *
        24 *
        60 *
        60 *
        1000;

    for (const submission of submissions) {
      if (
        submission.verdict !== "OK"
      )
        continue;

      const key =
        submission.problem.contestId +
        "-" +
        submission.problem.index;

      solvedSet.add(key);

      if (
        submission
          .creationTimeSeconds *
          1000 >
        thirtyDaysAgo
      ) {
        recentSet.add(key);
      }

      accepted.push(submission);
    }

    accepted.sort(
      (a, b) =>
        b.creationTimeSeconds -
        a.creationTimeSeconds
    );

    const recentSolved =
      accepted.slice(0, 5).map(
        (submission) => ({
          problemName:
            submission.problem.name,

          rating:
            submission.problem.rating,

          contestId:
            submission.problem
              .contestId,

          index:
            submission.problem
              .index,
        })
      );

    return {
      totalSolved:
        solvedSet.size,

      solvedLast30Days:
        recentSet.size,

      contestCount:
        contests.length,

      recentSolved,
    };
  };