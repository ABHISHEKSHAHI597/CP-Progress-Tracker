import {
  getUserRatingHistory,
  getUserStatus,
} from "../services/codeforces.service.js";

import {
  mapContestHistory,
  problemKey,
  retentionCutoff,
  toRecentSolved,
  toWindowEntry,
  windowStats,
  RECENT_SOLVED_LIMIT,
} from "./solveWindow.js";

/**
 * Rebuilds everything for one handle from the complete Codeforces history.
 *
 * This is the expensive path: `user.status` with no paging returns every
 * submission the person has ever made. It runs when a handle is first added and
 * on the weekly repair pass, not on the regular refresh.
 */
export async function buildUserStats(handle) {
  const submissions = await getUserStatus(handle);
  const contests = await getUserRatingHistory(handle);

  const solvedKeys = new Set();
  const windowSolves = [];
  const recentSolved = [];
  const seenRecent = new Set();

  const cutoff = retentionCutoff();

  // The watermark spans every submission, not only the accepted ones, so the
  // incremental sync knows exactly where it left off.
  let lastSubmissionId = 0;

  for (const submission of submissions) {
    if (submission.id > lastSubmissionId) lastSubmissionId = submission.id;

    if (submission.verdict !== "OK") continue;

    const key = problemKey(submission.problem);

    solvedKeys.add(key);

    if (submission.creationTimeSeconds * 1000 > cutoff) {
      windowSolves.push(toWindowEntry(submission));
    }

    // Submissions arrive newest first, so the first sighting of a problem is
    // its most recent solve. Re-solving something does not fill the list.
    if (recentSolved.length < RECENT_SOLVED_LIMIT && !seenRecent.has(key)) {
      seenRecent.add(key);
      recentSolved.push(toRecentSolved(submission));
    }
  }

  const contestHistory = mapContestHistory(contests);

  return {
    totalSolved: solvedKeys.size,
    contestCount: contests.length,
    recentSolved,
    contestHistory,

    solvedKeys: [...solvedKeys],
    windowSolves,
    lastSubmissionId,
    submissionsSyncedAt: new Date(),
    fullResyncAt: new Date(),

    ...windowStats(windowSolves, contestHistory),
  };
}
