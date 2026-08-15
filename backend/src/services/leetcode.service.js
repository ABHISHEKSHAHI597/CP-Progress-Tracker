import {
  getNextWeeklyOccurrences,
  getNextBiweeklyOccurrences,
} from "../utils/scheduleHelper.js";

// LeetCode Weekly Contest: every Sunday, 8:00 AM IST (02:30 UTC), 1.5 hrs
// LeetCode Biweekly Contest: alternate Saturdays, 8:00 PM IST (14:30 UTC), 1.5 hrs
export const getUpcomingLeetCodeContests = async () => {
  const weekly = getNextWeeklyOccurrences({
    dayOfWeek: 0, // Sunday
    hourUTC: 2,
    minuteUTC: 30,
    count: 1,
  }).map((date) => ({
    id: `lc-weekly-${date.getTime()}`,
    name: "LeetCode Weekly Contest",
    platform: "LeetCode",
    type: "Weekly",
    duration: 1.5,
    startTime: date.getTime(),
    link: "https://leetcode.com/contest/",
  }));

  const biweekly = getNextBiweeklyOccurrences({
    // Anchor: a known Biweekly Contest slot. Adjust by ±7 days if parity is off.
    anchorDateUTC: "2025-08-16T14:30:00Z",
    count: 1,
  }).map((date) => ({
    id: `lc-biweekly-${date.getTime()}`,
    name: "LeetCode Biweekly Contest",
    platform: "LeetCode",
    type: "Biweekly",
    duration: 1.5,
    startTime: date.getTime(),
    link: "https://leetcode.com/contest/",
  }));

  return [...weekly, ...biweekly];
};