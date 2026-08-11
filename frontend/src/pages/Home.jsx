import { useEffect, useState } from "react";
import API from "../services/api";

import StatsCard from "../components/StatsCard";
import UserCard from "../components/UserCard";

import {
  FaUsers,
  FaCode,
  FaTrophy,
  FaChartLine,
} from "react-icons/fa";

function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = users.length;

  const totalSolved = users.reduce(
    (sum, user) => sum + (user.totalSolved || 0),
    0
  );

  const averageRating =
    totalUsers > 0
      ? Math.round(
          users.reduce(
            (sum, user) => sum + (user.rating || 0),
            0
          ) / totalUsers
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
    <div>
      {/* Header */}

      <div className="mb-10">
        <h1 className="text-5xl font-bold">
          CP Progress Tracker
        </h1>

        <p className="text-slate-400 mt-3 text-lg">
          Monitor Codeforces progress, ratings and contest performance.
        </p>
      </div>

      {/* Stats */}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5 mb-10">
        <StatsCard
          title="Tracked Users"
          value={totalUsers}
          icon={<FaUsers />}
        />

        <StatsCard
          title="Total Solved"
          value={totalSolved.toLocaleString()}
          icon={<FaCode />}
        />

        <StatsCard
          title="Upcoming Contests"
          value="0"
          icon={<FaTrophy />}
        />

        <StatsCard
          title="Average Rating"
          value={averageRating}
          icon={<FaChartLine />}
        />
      </div>

      {/* Users */}

      <div>
        <h2 className="text-3xl font-bold mb-8">
          Tracked Users
        </h2>

        <div className="space-y-8">
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={{
                ...user,

                cfId: user._id,

                contests:
                  user.contestCount || 0,

                solved30:
                  user.solvedLast30Days || 0,

                lastOnline:
                  user.lastOnlineTime || "N/A",

                lastFiveSolved:
                  user.recentSolved || [],
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;