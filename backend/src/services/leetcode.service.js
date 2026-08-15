import axios from "axios";

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

export const getUpcomingLeetCodeContests = async () => {
  const query = `
    query {
      allContests {
        title
        titleSlug
        startTime
        duration
      }
    }
  `;

  const { data } = await axios.post(
    LEETCODE_GRAPHQL,
    { query },
    {
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
    }
  );

  const now = Date.now();
  const contests = data?.data?.allContests || [];

  return contests
    .filter((contest) => contest.startTime * 1000 > now)
    .map((contest) => ({
      id: `lc-${contest.titleSlug}`,
      name: contest.title,
      platform: "LeetCode",
      type: contest.titleSlug.includes("biweekly")
        ? "Biweekly"
        : "Weekly",
      duration: Math.round((contest.duration / 3600) * 10) / 10,
      startTime: contest.startTime * 1000,
      link: `https://leetcode.com/contest/${contest.titleSlug}`,
    }));
};