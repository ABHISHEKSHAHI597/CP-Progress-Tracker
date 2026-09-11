const DAY_MS = 24 * 60 * 60 * 1000;

/** The window the site reports on. */
export const WINDOW_DAYS = 30;

/** Kept a little longer than the window so a late sync cannot lose entries. */
export const RETENTION_DAYS = 35;

export const RECENT_SOLVED_LIMIT = 5;

export const problemKey = (problem) => `${problem.contestId}-${problem.index}`;

export const windowCutoff = () => Date.now() - WINDOW_DAYS * DAY_MS;
export const retentionCutoff = () => Date.now() - RETENTION_DAYS * DAY_MS;

const timeOf = (value) => new Date(value).getTime();

export const toWindowEntry = (submission) => ({
  id: submission.id,
  key: problemKey(submission.problem),
  at: new Date(submission.creationTimeSeconds * 1000),
  rating: submission.problem.rating || 0,
});

/**
 * Every accepted submission in the window feeds the average and median, so one
 * counted twice would skew them. Paging can re-read a submission when someone
 * submits mid-walk, which makes this the difference between idempotent and not.
 */
export const dedupeWindow = (entries) => {
  const seen = new Set();
  const unique = [];

  for (const entry of entries) {
    if (entry.id) {
      if (seen.has(entry.id)) continue;
      seen.add(entry.id);
    }

    unique.push(entry);
  }

  return unique;
};

export const toRecentSolved = (submission) => ({
  problemName: submission.problem.name,
  rating: submission.problem.rating,
  contestId: submission.problem.contestId,
  index: submission.problem.index,
});

export const pruneWindow = (entries) => {
  const cutoff = retentionCutoff();
  return (entries || []).filter((entry) => timeOf(entry.at) > cutoff);
};

/** Newest first, one entry per problem. */
export const mergeRecentSolved = (incoming, existing) => {
  const seen = new Set();
  const merged = [];

  for (const solve of [...(incoming || []), ...(existing || [])]) {
    const key = `${solve.contestId}-${solve.index}`;

    if (seen.has(key)) continue;
    seen.add(key);

    merged.push({
      problemName: solve.problemName,
      rating: solve.rating,
      contestId: solve.contestId,
      index: solve.index,
    });

    if (merged.length === RECENT_SOLVED_LIMIT) break;
  }

  return merged;
};

export const mapContestHistory = (contests) =>
  contests.map((contest) => ({
    contestId: contest.contestId,
    contestName: contest.contestName,
    rank: contest.rank,
    oldRating: contest.oldRating,
    newRating: contest.newRating,
    ratingChange: contest.newRating - contest.oldRating,
    contestTime: new Date(contest.ratingUpdateTimeSeconds * 1000),
  }));

/**
 * The rolling figures the standings are built from.
 *
 * Every figure the score multiplies together is drawn from the same set: one
 * entry per distinct problem, rated problems only. Re-solving something must
 * not move the average, and an unrated problem must not count toward a total
 * the average cannot see, or the two terms describe different sets of work.
 *
 * `solvedLast30Days` is the exception. It is what the site displays, so it
 * stays a plain count of everything solved. `ratedSolvedLast30Days` is what
 * the score uses.
 */
export function windowStats(windowSolves, contestHistory) {
  const cutoff = windowCutoff();

  const inWindow = (windowSolves || []).filter((entry) => timeOf(entry.at) > cutoff);

  // First sighting wins. A problem's rating does not change between solves, so
  // which accepted submission it came from does not matter.
  const ratingByProblem = new Map();

  for (const entry of inWindow) {
    if (!entry.rating) continue;
    if (ratingByProblem.has(entry.key)) continue;

    ratingByProblem.set(entry.key, entry.rating);
  }

  const ratings = [...ratingByProblem.values()].sort((a, b) => a - b);

  const contests = (contestHistory || []).filter(
    (contest) => contest.contestTime && timeOf(contest.contestTime) > cutoff
  );

  let median = 0;

  if (ratings.length) {
    const mid = Math.floor(ratings.length / 2);

    median =
      ratings.length % 2 ? ratings[mid] : (ratings[mid] + ratings[mid - 1]) / 2;
  }

  return {
    solvedLast30Days: new Set(inWindow.map((entry) => entry.key)).size,
    ratedSolvedLast30Days: ratings.length,
    contestsLast30Days: contests.length,
    avgProblemRating30Days: ratings.length
      ? Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1))
      : 0,
    medianProblemRating30Days: median,
  };
}
