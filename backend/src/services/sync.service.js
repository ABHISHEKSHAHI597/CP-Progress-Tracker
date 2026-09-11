import User from "../models/User.js";

import {
  getUserInfos,
  getUserRatingHistory,
  getUserStatus,
} from "./codeforces.service.js";

import { buildUserStats } from "../utils/buildUserStats.js";

import {
  dedupeWindow,
  mapContestHistory,
  mergeRecentSolved,
  problemKey,
  pruneWindow,
  retentionCutoff,
  toRecentSolved,
  toWindowEntry,
  windowStats,
} from "../utils/solveWindow.js";

/**
 * Sized for the gap between runs, not for the history. Almost every sync finds
 * a handful of new submissions or none, so a small first page is what the tick
 * actually costs. Bursts just page again.
 */
const PAGE_SIZE = 25;

/** Past this many pages behind, a full rebuild is cheaper than paging. */
const MAX_PAGES = 20;

const INTERNAL_FIELDS = "+solvedKeys +windowSolves +lastSubmissionId +fullResyncAt";

/**
 * One sync per handle at a time. A visitor pressing refresh while the
 * background job is already working on that handle joins the run in progress
 * instead of starting a second one.
 */
const inFlight = new Map();

const profileFieldsOf = (profile) => ({
  cfId: profile.id,
  rank: profile.rank,
  maxRank: profile.maxRank,
  rating: profile.rating,
  maxRating: profile.maxRating,
  contribution: profile.contribution,
  friendOfCount: profile.friendOfCount,
  registrationTime: new Date(profile.registrationTimeSeconds * 1000),
  lastOnlineTime: new Date(profile.lastOnlineTimeSeconds * 1000),
});

/**
 * Profiles for the whole roster in one request.
 *
 * This is the cheap tick. It also decides what the expensive jobs need to do:
 * a rating that moved means the contest history is out of date.
 */
export async function syncProfiles() {
  const users = await User.find({}, "handle rating contestCount contestHistory");

  if (!users.length) return { checked: 0, ratingChanged: [], missing: [] };

  const { profiles, missing } = await getUserInfos(users.map((user) => user.handle));

  const byHandle = new Map(users.map((user) => [user.handle.toLowerCase(), user]));

  const writes = [];
  const ratingChanged = [];

  for (const profile of profiles) {
    const stored = byHandle.get(profile.handle.toLowerCase());
    if (!stored) continue;

    // A contest can leave a rating unchanged, so an empty history counts too.
    if (stored.rating !== profile.rating || !stored.contestHistory?.length) {
      ratingChanged.push(stored.handle);
    }

    writes.push({
      updateOne: {
        filter: { _id: stored._id },
        update: { $set: profileFieldsOf(profile) },
      },
    });
  }

  if (writes.length) await User.bulkWrite(writes, { ordered: false });

  return { checked: profiles.length, ratingChanged, missing };
}

/** Only called for handles whose rating actually moved. */
export async function syncRatingHistories(handles) {
  let updated = 0;

  for (const handle of handles) {
    try {
      const contests = await getUserRatingHistory(handle);
      const contestHistory = mapContestHistory(contests);

      const user = await User.findOne({ handle }).select(INTERNAL_FIELDS);
      if (!user) continue;

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            contestHistory,
            contestCount: contests.length,
            ...windowStats(user.windowSolves, contestHistory),
          },
        }
      );

      updated += 1;
    } catch (error) {
      console.log(`Rating history failed for ${handle}: ${error.message}`);
    }
  }

  return updated;
}

/**
 * Walks back from the newest submission until it reaches the watermark.
 * In the steady state this is a single page of a hundred.
 */
async function fetchSubmissionsSince(handle, watermark) {
  const collected = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const batch = await getUserStatus(handle, {
      from: page * PAGE_SIZE + 1,
      count: PAGE_SIZE,
    });

    for (const submission of batch) {
      if (submission.id <= watermark) return { submissions: collected, caughtUp: true };
      collected.push(submission);
    }

    // A short page is the end of their history.
    if (batch.length < PAGE_SIZE) return { submissions: collected, caughtUp: true };
  }

  return { submissions: collected, caughtUp: false };
}

async function applySubmissions(user, submissions) {
  const solvedKeys = new Set(user.solvedKeys || []);
  const cutoff = retentionCutoff();

  let lastSubmissionId = user.lastSubmissionId || 0;

  const windowAdditions = [];
  const recentAdditions = [];
  const seenRecent = new Set();

  // Newest first, so the first sighting of a problem is its latest solve.
  for (const submission of submissions) {
    if (submission.id > lastSubmissionId) lastSubmissionId = submission.id;

    if (submission.verdict !== "OK") continue;

    const key = problemKey(submission.problem);

    solvedKeys.add(key);

    if (submission.creationTimeSeconds * 1000 > cutoff) {
      windowAdditions.push(toWindowEntry(submission));
    }

    if (!seenRecent.has(key)) {
      seenRecent.add(key);
      recentAdditions.push(toRecentSolved(submission));
    }
  }

  const windowSolves = dedupeWindow([
    ...windowAdditions,
    ...pruneWindow(user.windowSolves),
  ]);
  const recentSolved = mergeRecentSolved(recentAdditions, user.recentSolved);

  const stats = windowStats(windowSolves, user.contestHistory);

  const unchanged =
    submissions.length === 0 &&
    user.totalSolved === solvedKeys.size &&
    user.solvedLast30Days === stats.solvedLast30Days &&
    user.ratedSolvedLast30Days === stats.ratedSolvedLast30Days &&
    user.contestsLast30Days === stats.contestsLast30Days &&
    user.avgProblemRating30Days === stats.avgProblemRating30Days &&
    user.medianProblemRating30Days === stats.medianProblemRating30Days &&
    windowSolves.length === (user.windowSolves?.length || 0);

  if (unchanged) return false;

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        totalSolved: solvedKeys.size,
        recentSolved,
        solvedKeys: [...solvedKeys],
        windowSolves,
        lastSubmissionId,
        submissionsSyncedAt: new Date(),
        ...stats,
      },
    }
  );

  return true;
}

async function fullResync(handle) {
  const stats = await buildUserStats(handle);

  await User.updateOne({ handle }, { $set: stats });
}

/**
 * Brings every user's submissions up to date.
 *
 * Handles with no watermark have never been synced incrementally, so they need
 * one full rebuild first. That is budgeted per run so migrating an existing
 * roster spreads over a few hours instead of arriving as one burst.
 */
/**
 * Brings one handle's submissions up to date, paging only back to the
 * watermark. Returns what it did so the caller can budget the expensive path.
 */
export function syncUserSubmissions(handle, options = {}) {
  const existing = inFlight.get(handle);
  if (existing) return existing;

  const run = runUserSubmissions(handle, options).finally(() => inFlight.delete(handle));

  inFlight.set(handle, run);

  return run;
}

async function runUserSubmissions(handle, { allowFullResync = true } = {}) {
  const user = await User.findOne({ handle }).select(INTERNAL_FIELDS);

  if (!user) return "missing";

  const rebuild = async () => {
    if (!allowFullResync) return "deferred";

    await fullResync(handle);
    return "rebuilt";
  };

  // No watermark means this handle has never been synced incrementally.
  if (!user.lastSubmissionId) return rebuild();

  const { submissions, caughtUp } = await fetchSubmissionsSince(
    handle,
    user.lastSubmissionId
  );

  // Too far behind to page. A full rebuild is cheaper and self-correcting.
  if (!caughtUp) return rebuild();

  return (await applySubmissions(user, submissions)) ? "updated" : "unchanged";
}

/**
 * Brings every user's submissions up to date.
 *
 * Handles with no watermark have never been synced incrementally, so they need
 * one full rebuild first. That is budgeted per run so migrating an existing
 * roster spreads over a few hours instead of arriving as one burst.
 */
export async function syncSubmissions({ fullResyncBudget = 4 } = {}) {
  const users = await User.find({}, "handle");

  const tally = { updated: 0, unchanged: 0, rebuilt: 0, deferred: 0 };

  for (const { handle } of users) {
    try {
      const outcome = await syncUserSubmissions(handle, {
        allowFullResync: tally.rebuilt < fullResyncBudget,
      });

      if (outcome in tally) tally[outcome] += 1;
    } catch (error) {
      console.log(`Submission sync failed for ${handle}: ${error.message}`);
    }
  }

  return tally;
}

/**
 * Incremental sync trusts a watermark, so it cannot notice a rejudge or heal a
 * gap on its own. A slow full rebuild of the oldest handles keeps it honest.
 */
export async function repairStaleUsers({ limit = 2, maxAgeDays = 7 } = {}) {
  const before = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);

  const stale = await User.find({
    $or: [{ fullResyncAt: { $lt: before } }, { fullResyncAt: { $exists: false } }],
  })
    .select("+fullResyncAt")
    .sort({ fullResyncAt: 1 })
    .limit(limit);

  let repaired = 0;

  for (const user of stale) {
    try {
      await fullResync(user.handle);
      repaired += 1;
    } catch (error) {
      console.log(`Repair failed for ${user.handle}: ${error.message}`);
    }
  }

  return repaired;
}
