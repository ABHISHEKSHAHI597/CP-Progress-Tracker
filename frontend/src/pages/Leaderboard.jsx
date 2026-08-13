import { useEffect, useState } from "react";
import API from "../services/api";

function Leaderboard() {
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers =
    async () => {
      try {
        const res =
          await API.get("/users");

        const sorted =
          res.data.sort(
            (a, b) =>
              b.solvedLast30Days -
              a.solvedLast30Days
          );

        setUsers(sorted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="text-white text-xl">
        Loading...
      </div>
    );
  }

  const totalQuestions =
    users.reduce(
      (sum, user) =>
        sum +
        (user.solvedLast30Days ||
          0),
      0
    );

  const totalContests =
    users.reduce(
      (sum, user) =>
        sum +
        (user.contestsLast30Days ||
          0),
      0
    );

  const highestAverage =
    Math.max(
      ...users.map(
        (user) =>
          user.avgProblemRating30Days ||
          0
      ),
      0
    );

  return (
    <div className="text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold mb-3">
          🏆 Leaderboard
        </h1>

        <p className="text-slate-400 text-xl">
          Last 30 Days
          Performance
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400">
            Users
          </p>

          <h2 className="text-3xl font-bold">
            {users.length}
          </h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400">
            Questions
          </p>

          <h2 className="text-3xl font-bold">
            {totalQuestions}
          </h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400">
            Contests
          </p>

          <h2 className="text-3xl font-bold">
            {totalContests}
          </h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400">
            Highest Avg Rating
          </p>

          <h2 className="text-3xl font-bold">
            {highestAverage}
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800">
              <th className="p-4">
                #
              </th>

              <th className="p-4 text-left">
                User
              </th>

              <th className="p-4">
                Questions
              </th>

              <th className="p-4">
                Contests
              </th>

              <th className="p-4">
                Avg Rating
              </th>

              <th className="p-4">
                Median Rating
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map(
              (user, index) => (
                <tr
                  key={user._id}
                  className="border-t border-slate-800 hover:bg-slate-900"
                >
                  <td className="p-4 text-center font-bold">
                    {index + 1}
                  </td>

                  <td className="p-4">
                    <div>
                      <p className="font-semibold">
                        {
                          user.handle
                        }
                      </p>

                      <p className="text-sm text-slate-400">
                        {user.rank}
                      </p>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    {
                      user.solvedLast30Days
                    }
                  </td>

                  <td className="p-4 text-center">
                    {
                      user.contestsLast30Days
                    }
                  </td>

                  <td className="p-4 text-center text-blue-400 font-semibold">
                    {
                      user.avgProblemRating30Days
                    }
                  </td>

                  <td className="p-4 text-center">
                    {
                      user.medianProblemRating30Days
                    }
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;