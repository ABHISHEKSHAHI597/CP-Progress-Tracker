import { useEffect, useState } from "react";
import API from "../services/api";
import { UseDocumentTitle } from "../hooks/UseDocumentTitle";

// Final Score = Q * (A / 1000)^2 * 2^((A - U) / 400) * (1 + C * 0.05)
//   Q = problems solved in the last 30 days
//   A = average problem rating of the last 30 days
//   U = user's current Codeforces rating
//   C = contests participated in the last 30 days
const getScore = (user) => {
  const Q = user.solvedLast30Days || 0;
  const A = user.avgProblemRating30Days || 0;
  const C = user.contestsLast30Days || 0;
  // Unrated accounts have no rating; treat them as 800 so the exponent stays sane.
  const U = user.rating || user.maxRating || 800;

  if (!Q || !A) return 0;

  const score =
    Q *
    Math.pow(A / 1000, 2) *
    Math.pow(2, (A - U) / 400) *
    (1 + C * 0.05);

  return Number.isFinite(score) ? score : 0;
};

const formatScore = (score) => score.toFixed(2);

const rankColor = (index) => {
  if (index === 0) return "text-yellow-400";
  if (index === 1) return "text-slate-300";
  if (index === 2) return "text-amber-600";
  return "text-slate-400";
};

function Leaderboard() {
  UseDocumentTitle("Leaderboard");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");

      const ranked = res.data
        .map((user) => ({ ...user, score: getScore(user) }))
        .sort((a, b) => b.score - a.score);

      setUsers(ranked);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalQuestions = users.reduce(
    (sum, user) => sum + (user.solvedLast30Days || 0),
    0
  );

  const totalContests = users.reduce(
    (sum, user) => sum + (user.contestsLast30Days || 0),
    0
  );

  const topScore = users.length ? users[0].score : 0;

  return (
    <div className="text-white px-1 sm:px-0">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">
          🏆 Leaderboard
        </h1>

        <p className="text-slate-400 text-base sm:text-lg md:text-xl">
          Last 30 days performance
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
        <div className="bg-slate-800 rounded-xl p-4 sm:p-5">
          <p className="text-slate-400 text-sm sm:text-base">Users</p>
          <h2 className="text-2xl sm:text-3xl font-bold">{users.length}</h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 sm:p-5">
          <p className="text-slate-400 text-sm sm:text-base">Questions</p>
          <h2 className="text-2xl sm:text-3xl font-bold">{totalQuestions}</h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 sm:p-5">
          <p className="text-slate-400 text-sm sm:text-base">Contests</p>
          <h2 className="text-2xl sm:text-3xl font-bold">{totalContests}</h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 sm:p-5">
          <p className="text-slate-400 text-sm sm:text-base">Top Score</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-400">
            {formatScore(topScore)}
          </h2>
        </div>
      </div>

      {/* Table — medium screens and up */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-800">
              <th className="p-4 sticky top-0 bg-slate-800 z-10">#</th>
              <th className="p-4 text-left sticky top-0 bg-slate-800 z-10">
                User
              </th>
              <th className="p-4 sticky top-0 bg-slate-800 z-10">Score</th>
              <th className="p-4 sticky top-0 bg-slate-800 z-10">Questions</th>
              <th className="p-4 sticky top-0 bg-slate-800 z-10">Contests</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, index) => (
              <tr
                key={user._id}
                className="border-t border-slate-800 hover:bg-slate-900"
              >
                <td
                  className={`p-4 text-center font-bold ${rankColor(index)}`}
                >
                  {index + 1}
                </td>

                <td className="p-4">
                  <p className="font-semibold">
                    <a
                      href={`https://codeforces.com/profile/${user.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-blue-400"
                    >
                      {user.handle}
                    </a>
                  </p>

                  <p className="text-sm text-slate-400">{user.rank}</p>
                </td>

                <td className="p-4 text-center text-blue-400 font-semibold">
                  {formatScore(user.score)}
                </td>

                <td className="p-4 text-center">{user.solvedLast30Days}</td>

                <td className="p-4 text-center">{user.contestsLast30Days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — small screens */}
      <div className="md:hidden space-y-3">
        {users.map((user, index) => (
          <div
            key={user._id}
            className="bg-slate-800/60 border border-slate-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-xl font-bold w-7 shrink-0 ${rankColor(index)}`}
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <a
                  href={`https://codeforces.com/profile/${user.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold block truncate hover:underline hover:text-blue-400"
                >
                  {user.handle}
                </a>

                <p className="text-xs text-slate-400">{user.rank}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-blue-400 leading-tight">
                  {formatScore(user.score)}
                </p>
                <p className="text-xs text-slate-400">score</p>
              </div>
            </div>

            <div className="flex gap-6 mt-3 pt-3 border-t border-slate-700/60 text-sm">
              <p className="text-slate-400">
                Questions{" "}
                <span className="text-white font-semibold">
                  {user.solvedLast30Days}
                </span>
              </p>

              <p className="text-slate-400">
                Contests{" "}
                <span className="text-white font-semibold">
                  {user.contestsLast30Days}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-slate-400 text-center py-10">
          No activity in the last 30 days yet.
        </p>
      )}
    </div>
  );
}

export default Leaderboard;