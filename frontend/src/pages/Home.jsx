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
import { UseDocumentTitle } from '../hooks/UseDocumentTitle';

function Home() {
  UseDocumentTitle('Home');
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

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          CP Progress Tracker
        </h1>

        <p className="text-slate-400 mt-2 text-sm sm:text-base">
          Monitor Codeforces progress, ratings and contest performance.
        </p>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
          title="Average Rating"
          value={averageRating}
          icon={<FaChartLine />}
        />

        <StatsCard
          title="Highest Rating"
          value={
            users.length
              ? Math.max(...users.map(u => u.rating || 0))
              : 0
          }
          icon={<FaTrophy />}
        />

        <StatsCard
          title="Total Contests"
          value={users.reduce(
            (sum, user) => sum + (user.contestCount || 0),
            0
          )}
          icon={<FaTrophy />}
        />
      </div>

      {/* Users */}

      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5">
          Tracked Users
        </h2>

        <div className="space-y-4">
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={{
                ...user,
                cfId: user.cfId,

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