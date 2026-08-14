import { useEffect, useRef, useState } from "react";
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

import {
  FaChartLine,
  FaTrophy,
  FaMedal,
  FaCode,
  FaChevronDown,
  FaArrowUp,
  FaArrowDown,
  FaUserCircle,
} from "react-icons/fa";
import { UseDocumentTitle } from '../hooks/UseDocumentTitle';

function ContestTracker() {
  UseDocumentTitle('Contest Tracker');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");

      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-3xl font-extrabold bg-linear-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Contest Tracker
        </h1>

        <p className="text-slate-400 mt-1.5 text-sm">
          Analyze contest performance and rating growth.
        </p>
      </div>

      {/* User Selector */}

      <div className="relative z-20 bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Select User
        </h2>

        {users.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No tracked users found.
          </p>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between gap-3 bg-slate-800 border border-slate-700 pl-4 pr-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <FaUserCircle className="text-blue-400 shrink-0" />

                <span className="truncate">
                  {selectedUser
                    ? `${selectedUser.handle} · ${selectedUser.rating}`
                    : "Select a user"}
                </span>
              </span>

              <FaChevronDown
                className={`text-slate-500 text-xs shrink-0 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute z-50 mt-2 w-full max-h-64 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl divide-y divide-slate-700/50">
                {users.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition ${
                      selectedUser?._id === user._id
                        ? "bg-blue-600/20 text-blue-400"
                        : "hover:bg-slate-700/60"
                    }`}
                  >
                    <span className="truncate">
                      {user.handle}
                    </span>

                    <span className="text-slate-400 shrink-0">
                      {user.rating}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative z-0 space-y-6">
      {!selectedUser ? (
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-2">
          <FaUserCircle className="text-slate-600 text-4xl mb-1" />

          <p className="text-slate-400 text-sm">
            Select a user above to view their contest stats and rating progress.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}

          <div className="grid md:grid-cols-4 gap-4">
            <StatCard
              label="Current Rating"
              value={selectedUser.rating}
              color="text-blue-400"
              icon={<FaChartLine size={20} />}
            />

            <StatCard
              label="Max Rating"
              value={selectedUser.maxRating}
              color="text-green-400"
              icon={<FaTrophy size={20} />}
            />

            <StatCard
              label="Best Rank"
              value={bestRank || "—"}
              color="text-yellow-400"
              icon={<FaMedal size={20} />}
            />

            <StatCard
              label="Contests"
              value={selectedUser.contestCount}
              color="text-purple-400"
              icon={<FaCode size={20} />}
            />
          </div>

          {/* Rating Graph */}

          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-5">
            <h2 className="text-lg font-bold mb-4">
              Rating Progress
            </h2>

            {graphData.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-slate-500 text-sm">
                No contest history yet.
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={graphData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -10,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                    />

                    <XAxis
                      dataKey="contest"
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 11,
                      }}
                      axisLine={{ stroke: "#334155" }}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 11,
                      }}
                      axisLine={{ stroke: "#334155" }}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "0.75rem",
                        fontSize: "0.85rem",
                      }}
                      labelStyle={{ color: "#e2e8f0" }}
                      cursor={{ stroke: "#3b82f6", strokeWidth: 1 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{
                        r: 3,
                        fill: "#3b82f6",
                        strokeWidth: 0,
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Extra Stats */}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-5">
              <p className="text-slate-400 text-sm uppercase tracking-wide mb-2">
                Rank
              </p>

              <p className="text-3xl font-bold text-orange-400 capitalize">
                {selectedUser.rank}
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-5">
              <p className="text-slate-400 text-sm uppercase tracking-wide mb-2">
                Biggest Rating Gain
              </p>

              <p className="text-3xl font-bold text-green-400">
                +{biggestGain}
              </p>
            </div>
          </div>

          {/* Contest History */}

          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-lg font-bold">
                Contest History
              </h2>
            </div>

            {!selectedUser.contestHistory?.length ? (
              <p className="text-slate-500 text-sm p-5">
                No contests recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left py-3 px-5 font-medium">
                        Contest
                      </th>

                      <th className="text-center px-3 font-medium">
                        Rank
                      </th>

                      <th className="text-center px-3 font-medium">
                        Old
                      </th>

                      <th className="text-center px-3 font-medium">
                        New
                      </th>

                      <th className="text-center px-5 font-medium">
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
                            className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                          >
                            <td className="py-3.5 px-5 font-medium">
                              {
                                contest.contestName
                              }
                            </td>

                            <td className="text-center px-3 text-slate-300">
                              {
                                contest.rank
                              }
                            </td>

                            <td className="text-center px-3 text-slate-400">
                              {
                                contest.oldRating
                              }
                            </td>

                            <td className="text-center px-3 text-blue-400 font-semibold">
                              {
                                contest.newRating
                              }
                            </td>

                            <td className="text-center px-5">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  contest.ratingChange >=
                                  0
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {contest.ratingChange >= 0 ? (
                                  <FaArrowUp className="text-[10px]" />
                                ) : (
                                  <FaArrowDown className="text-[10px]" />
                                )}
                                {contest.ratingChange > 0
                                  ? "+"
                                  : ""}
                                {
                                  contest.ratingChange
                                }
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">
            {label}
          </p>

          <h2 className={`text-3xl font-bold mt-1.5 ${color}`}>
            {value}
          </h2>
        </div>

        <div className={`${color} opacity-80`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default ContestTracker;