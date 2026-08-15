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

    const ratingsSinceCutoff = [];

    // Rolling 30-day window, but never goes earlier than Aug 1.
    // e.g. right now (before 30 days have passed since Aug 1) the
    // window is Aug 1 -> today. Once 30+ days have passed since
    // Aug 1, this naturally becomes a true rolling 30-day window.
    const thirtyDaysAgo =
      Date.now() -
      30 *
        24 *
        60 *
        60 *
        1000;

    const hardStart = Date.UTC(2025, 7, 1); // Aug 1, 2025 (month is 0-indexed)

    const cutoff = Math.max(
      thirtyDaysAgo,
      hardStart
    );

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

      const submissionTime =
        submission.creationTimeSeconds *
        1000;

      if (
        submissionTime >
        cutoff
      ) {
        recentSet.add(key);

        if (
          submission.problem.rating
        ) {
          ratingsSinceCutoff.push(
            submission.problem.rating
          );
        }
      }

      accepted.push(submission);
    }

    accepted.sort(
      (a, b) =>
        b.creationTimeSeconds -
        a.creationTimeSeconds
    );

    const recentSolved =
      accepted
        .slice(0, 5)
        .map((submission) => ({
          problemName:
            submission.problem.name,

          rating:
            submission.problem.rating,

          contestId:
            submission.problem
              .contestId,

          index:
            submission.problem.index,
        }));

    const contestsSinceCutoff =
      contests.filter(
        (contest) =>
          contest.ratingUpdateTimeSeconds *
            1000 >
          cutoff
      );

    const avgRating =
      ratingsSinceCutoff.length > 0
        ? Number(
            (
              ratingsSinceCutoff.reduce(
                (a, b) => a + b,
                0
              ) /
              ratingsSinceCutoff.length
            ).toFixed(1)
          )
        : 0;

    let medianRating = 0;

    if (ratingsSinceCutoff.length) {
      ratingsSinceCutoff.sort(
        (a, b) => a - b
      );

      const mid =
        Math.floor(
          ratingsSinceCutoff.length / 2
        );

      medianRating =
        ratingsSinceCutoff.length % 2
          ? ratingsSinceCutoff[mid]
          : (
              ratingsSinceCutoff[mid] +
              ratingsSinceCutoff[mid - 1]
            ) / 2;
    }

    return {
      totalSolved:
        solvedSet.size,

      solvedLast30Days:
        recentSet.size,

      contestCount:
        contests.length,

      recentSolved,

      contestHistory:
        contests.map(
          (contest) => ({
            contestId:
              contest.contestId,

            contestName:
              contest.contestName,

            rank:
              contest.rank,

            oldRating:
              contest.oldRating,

            newRating:
              contest.newRating,

            ratingChange:
              contest.newRating -
              contest.oldRating,

            contestTime:
              new Date(
                contest.ratingUpdateTimeSeconds *
                  1000
              ),
          })
        ),

      contestsLast30Days:
        contestsSinceCutoff.length,

      avgProblemRating30Days:
        avgRating,

      medianProblemRating30Days:
        medianRating,
    };
  };