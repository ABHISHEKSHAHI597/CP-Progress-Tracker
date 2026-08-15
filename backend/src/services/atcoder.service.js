import { getNextWeeklyOccurrences } from "../utils/scheduleHelper.js";

// AtCoder Beginner Contest: every Saturday, 5:30 PM IST (12:00 UTC), ~100 min
export const getUpcomingAtCoderContests = async () => {
  const occurrences = getNextWeeklyOccurrences({
    dayOfWeek: 6, // Saturday
    hourUTC: 12,
    minuteUTC: 0,
    count: 1,
  });

  return occurrences.map((date) => ({
    id: `ac-${date.getTime()}`,
    name: "AtCoder Beginner Contest",
    platform: "AtCoder",
    type: "Beginner",
    duration: 1.7, // ~100 minutes
    startTime: date.getTime(),
    link: "https://atcoder.jp/contests/",
  }));
};