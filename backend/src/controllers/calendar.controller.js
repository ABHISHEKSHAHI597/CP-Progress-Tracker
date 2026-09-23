import axios from "axios";
import { getUpcomingLeetCodeContests } from "../services/leetcode.service.js";
import { getUpcomingCodeChefContests } from "../services/codechef.service.js";
import { getUpcomingAtCoderContests } from "../services/atcoder.service.js";

/**
 * contest.list is the whole Codeforces archive and changes a few times a day.
 * Fetching it per visitor let anyone drive this server into Codeforces' rate
 * limit, which the refresh jobs share, so one copy serves everyone for a while.
 */
const CACHE_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15000;

let cached = null;
let cachedAt = 0;
let inFlight = null;

async function buildCalendar() {
  const { data } = await axios.get(
    "https://codeforces.com/api/contest.list",
    { timeout: REQUEST_TIMEOUT_MS }
  );

  const contests = data.result;

  const cfUpcoming = contests
    .filter((contest) => contest.phase === "BEFORE")
    .slice(0, 10)
    .map((contest) => ({
      id: `cf-${contest.id}`,
      name: contest.name,
      platform: "Codeforces",
      type: contest.type,
      duration: Math.round(contest.durationSeconds / 3600),
      startTime: contest.startTimeSeconds * 1000,
      link: `https://codeforces.com/contest/${contest.id}`,
    }));

  const previous = contests
    .filter((contest) => contest.phase === "FINISHED")
    .slice(0, 5)
    .map((contest) => ({
      id: contest.id,
      name: contest.name,
      type: contest.type,
      duration: Math.round(contest.durationSeconds / 3600),
      startTime: contest.startTimeSeconds * 1000,
      link: `https://codeforces.com/contest/${contest.id}`,
    }));

  const results = await Promise.allSettled([
    getUpcomingLeetCodeContests(),
    getUpcomingCodeChefContests(),
    getUpcomingAtCoderContests(),
  ]);

  const otherUpcoming = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const upcoming = [...cfUpcoming, ...otherUpcoming].sort(
    (a, b) => a.startTime - b.startTime
  );

  return { upcoming, previous };
}

export const getContestCalendar = async (req, res) => {
  if (cached && Date.now() - cachedAt < CACHE_MS) {
    return res.json(cached);
  }

  try {
    // Visitors who arrive while a fetch is running wait on that one fetch.
    inFlight ??= buildCalendar().finally(() => {
      inFlight = null;
    });

    cached = await inFlight;
    cachedAt = Date.now();

    res.json(cached);
  } catch (error) {
    console.error("Contest calendar fetch failed:", error.message);

    // A stale calendar beats none, and the next visitor retries the fetch.
    if (cached) return res.json(cached);

    res.status(500).json({ message: "Failed to fetch contests" });
  }
};
