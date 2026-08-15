import axios from "axios";

export const getUpcomingAtCoderContests = async () => {
  const { data } = await axios.get(
    "https://kenkoooo.com/atcoder/resources/contests.json"
  );

  const now = Date.now();

  return data
    .filter((contest) => contest.start_epoch_second * 1000 > now)
    .sort((a, b) => a.start_epoch_second - b.start_epoch_second)
    .slice(0, 10)
    .map((contest) => ({
      id: `ac-${contest.id}`,
      name: contest.title,
      platform: "AtCoder",
      type: "Contest",
      duration: Math.round((contest.duration_second / 3600) * 10) / 10,
      startTime: contest.start_epoch_second * 1000,
      link: `https://atcoder.jp/contests/${contest.id}`,
    }));
};