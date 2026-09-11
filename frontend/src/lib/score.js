/**
 * Form score for the last 30 days.
 *
 *   score = Q · (A/1000)² · 2^((A − U)/400) · (1 + 0.05·C)
 *
 *   Q  distinct rated problems solved in the last 30 days
 *   A  their average difficulty
 *   U  the user's current rating
 *   C  contests entered in the last 30 days
 *
 * Solving above your own rating is worth exponentially more, so volume
 * alone does not carry anyone to the top of the standings.
 */
export function formScore(user) {
  // Rated problems only, one per problem, so Q and A describe the same set.
  // The fallback covers a user the sync has not rewritten yet.
  const solved = user.ratedSolvedLast30Days ?? user.solvedLast30Days ?? 0;
  const avgDifficulty = user.avgProblemRating30Days || 0;
  const contests = user.contestsLast30Days || 0;

  // Unrated accounts have no rating; treat them as 800 so the exponent stays sane.
  const rating = user.rating || user.maxRating || 800;

  if (!solved || !avgDifficulty) return 0;

  const score =
    solved *
    Math.pow(avgDifficulty / 1000, 2) *
    Math.pow(2, (avgDifficulty - rating) / 400) *
    (1 + contests * 0.05);

  return Number.isFinite(score) ? score : 0;
}

export const formatScore = (score) => score.toFixed(2);
