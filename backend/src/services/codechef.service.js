import axios from "axios";

export const getUpcomingCodeChefContests = async () => {
  const { data } = await axios.get(
    "https://www.codechef.com/api/list/contests/all"
  );

  const contests = data?.future_contests || [];

  return contests.map((contest) => ({
    id: `cc-${contest.contest_code}`,
    name: contest.contest_name,
    platform: "CodeChef",
    type: "Contest",
    duration: Math.round((Number(contest.contest_duration) / 60) * 10) / 10, // minutes -> hours
    startTime: new Date(contest.contest_start_date_iso).getTime(),
    link: `https://www.codechef.com/${contest.contest_code}`,
  }));
};