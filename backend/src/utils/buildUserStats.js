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

    const ratings30Days = [];

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

      const submissionTime =
        submission.creationTimeSeconds *
        1000;

      if (
        submissionTime >
        thirtyDaysAgo
      ) {
        recentSet.add(key);

        if (
          submission.problem.rating
        ) {
          ratings30Days.push(
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

    const contests30Days =
      contests.filter(
        (contest) =>
          contest.ratingUpdateTimeSeconds *
            1000 >
          thirtyDaysAgo
      );

    const avgRating =
      ratings30Days.length > 0
        ? Number(
            (
              ratings30Days.reduce(
                (a, b) => a + b,
                0
              ) /
              ratings30Days.length
            ).toFixed(1)
          )
        : 0;

    let medianRating = 0;

    if (ratings30Days.length) {
      ratings30Days.sort(
        (a, b) => a - b
      );

      const mid =
        Math.floor(
          ratings30Days.length / 2
        );

      medianRating =
        ratings30Days.length % 2
          ? ratings30Days[mid]
          : (
              ratings30Days[mid] +
              ratings30Days[mid - 1]
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
        contests30Days.length,

      avgProblemRating30Days:
        avgRating,

      medianProblemRating30Days:
        medianRating,
    };
  };