import { getNextWeeklyOccurrences } from "../utils/scheduleHelper.js";

// CodeChef Starters: every Wednesday, 8:00 PM IST (14:30 UTC), ~3 hrs
export const getUpcomingCodeChefContests = async () => {
  const occurrences = getNextWeeklyOccurrences({
    dayOfWeek: 3, // Wednesday
    hourUTC: 14,
    minuteUTC: 30,
    count: 1,
  });

  return occurrences.map((date) => ({
    id: `cc-${date.getTime()}`,
    name: "CodeChef Starters",
    platform: "CodeChef",
    type: "Starters",
    duration: 3,
    startTime: date.getTime(),
    link: "https://www.codechef.com/contests",
  }));
};