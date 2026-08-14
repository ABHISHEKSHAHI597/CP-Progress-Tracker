import axios from "axios";

export const getContestCalendar = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://codeforces.com/api/contest.list"
    );

    const contests = data.result;

    const upcoming = contests
      .filter((contest) => contest.phase === "BEFORE")
      .slice(0, 10)
      .map((contest) => ({
        id: contest.id,
        name: contest.name,
        type: contest.type,
        duration: Math.round(
          contest.durationSeconds / 3600
        ),
        startTime:
          contest.startTimeSeconds * 1000,
      }));

    const previous = contests
      .filter((contest) => contest.phase === "FINISHED")
      .slice(0, 5)
      .map((contest) => ({
        id: contest.id,
        name: contest.name,
        type: contest.type,
        duration: Math.round(
          contest.durationSeconds / 3600
        ),
        startTime:
          contest.startTimeSeconds * 1000,
        link: `https://codeforces.com/contest/${contest.id}`,
      }));

    res.json({
      upcoming,
      previous,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch contests",
    });
  }
};