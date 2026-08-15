import axios from "axios";
import { getUpcomingLeetCodeContests } from "../services/leetcode.service.js";
import { getUpcomingCodeChefContests } from "../services/codechef.service.js";
import { getUpcomingAtCoderContests } from "../services/atcoder.service.js";

export const getContestCalendar = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://codeforces.com/api/contest.list"
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

    res.json({ upcoming, previous });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch contests" });
  }
};