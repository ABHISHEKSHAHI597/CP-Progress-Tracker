import { useEffect, useState } from "react";
import API from "../services/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function ContestTracker() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] =
    useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");

      setUsers(res.data);

      if (res.data.length > 0) {
        setSelectedUser(res.data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const graphData =
    selectedUser?.contestHistory?.map(
      (contest) => ({
        contest:
          contest.contestName.length > 15
            ? contest.contestName.slice(
                0,
                15
              ) + "..."
            : contest.contestName,

        rating: contest.newRating,
      })
    ) || [];

  const bestRank =
    selectedUser?.contestHistory?.length
      ? Math.min(
          ...selectedUser.contestHistory.map(
            (c) => c.rank
          )
        )
      : 0;

  const biggestGain =
    selectedUser?.contestHistory?.length
      ? Math.max(
          ...selectedUser.contestHistory.map(
            (c) => c.ratingChange
          )
        )
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          Contest Tracker
        </h1>

        <p className="text-slate-400 mt-2">
          Analyze contest performance
          and rating growth.
        </p>
      </div>

      {/* User Selector */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-xl font-semibold mb-4">
          Select User
        </h2>

        <select
          value={selectedUser?._id || ""}
          onChange={(e) => {
            const user = users.find(
              (u) =>
                u._id === e.target.value
            );

            setSelectedUser(user);
          }}
          className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-white w-full"
        >
          {users.map((user) => (
            <option
              key={user._id}
              value={user._id}
            >
              {user.handle}
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <>
          {/* Stats */}

          <div className="grid md:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400">
                Current Rating
              </p>

              <h2 className="text-3xl font-bold text-blue-400">
                {selectedUser.rating}
              </h2>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400">
                Max Rating
              </p>

              <h2 className="text-3xl font-bold text-green-400">
                {selectedUser.maxRating}
              </h2>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400">
                Best Rank
              </p>

              <h2 className="text-3xl font-bold text-yellow-400">
                {bestRank}
              </h2>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400">
                Contests
              </p>

              <h2 className="text-3xl font-bold text-purple-400">
                {
                  selectedUser.contestCount
                }
              </h2>
            </div>
          </div>

          {/* Rating Graph */}

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-2xl font-bold mb-5">
              Rating Progress
            </h2>

            <div className="h-[400px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={graphData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="contest"
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Extra Stats */}

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xl font-semibold mb-3">
                Rank
              </h3>

              <p className="text-4xl font-bold text-orange-400">
                {
                  selectedUser.rank
                }
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xl font-semibold mb-3">
                Biggest Rating Gain
              </h3>

              <p className="text-4xl font-bold text-green-400">
                +{biggestGain}
              </p>
            </div>
          </div>

          {/* Contest History */}

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-2xl font-bold mb-5">
              Contest History
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left py-3">
                      Contest
                    </th>

                    <th className="text-center">
                      Rank
                    </th>

                    <th className="text-center">
                      Old
                    </th>

                    <th className="text-center">
                      New
                    </th>

                    <th className="text-center">
                      Change
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {selectedUser.contestHistory
                    .slice()
                    .reverse()
                    .map(
                      (contest) => (
                        <tr
                          key={
                            contest.contestId
                          }
                          className="border-b border-slate-800"
                        >
                          <td className="py-4">
                            {
                              contest.contestName
                            }
                          </td>

                          <td className="text-center">
                            {
                              contest.rank
                            }
                          </td>

                          <td className="text-center">
                            {
                              contest.oldRating
                            }
                          </td>

                          <td className="text-center">
                            {
                              contest.newRating
                            }
                          </td>

                          <td
                            className={`text-center font-semibold ${
                              contest.ratingChange >=
                              0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {contest.ratingChange >
                            0
                              ? "+"
                              : ""}
                            {
                              contest.ratingChange
                            }
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ContestTracker;