import StatsCard from "../components/StatsCard";
import UserCard from "../components/UserCard";

import {
  FaUsers,
  FaCode,
  FaTrophy,
  FaChartLine,
} from "react-icons/fa";

function Home() {
  const users = [
    {
      handle: "tourist",
      cfId: 345897,
      rank: "Legendary Grandmaster",
      maxRank: "Legendary GM",

      rating: 3847,
      maxRating: 3979,

      contribution: 238,
      friendOfCount: 96,

      totalSolved: 10453,
      solved30: 184,

      contests: 214,
      lastOnline: "2h ago",
      memberSince: "Aug 2012",

      lastFiveSolved: [
        { name: "1988D", rating: 2200 },
        { name: "1935E", rating: 2100 },
        { name: "1988C", rating: 2000 },
        { name: "1944F", rating: 1900 },
        { name: "1986B", rating: 1800 },
      ],
    },

    {
      handle: "Benq",
      cfId: 157503,
      rank: "International Grandmaster",
      maxRank: "International GM",

      rating: 3532,
      maxRating: 3635,

      contribution: 182,
      friendOfCount: 73,

      totalSolved: 8923,
      solved30: 132,

      contests: 182,
      lastOnline: "5h ago",
      memberSince: "Dec 2013",

      lastFiveSolved: [
        { name: "1977E", rating: 2100 },
        { name: "1932F", rating: 2000 },
        { name: "1975D", rating: 1900 },
        { name: "1956C", rating: 1800 },
        { name: "1936B", rating: 1600 },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-5xl font-bold">
          CP Progress Tracker
        </h1>

        <p className="text-slate-400 mt-3 text-lg">
          Monitor Codeforces progress, ratings and contest performance.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5 mb-10">
        <StatsCard
          title="Tracked Users"
          value="15"
          icon={<FaUsers />}
        />

        <StatsCard
          title="Total Solved"
          value="34K+"
          icon={<FaCode />}
        />

        <StatsCard
          title="Upcoming Contests"
          value="3"
          icon={<FaTrophy />}
        />

        <StatsCard
          title="Average Rating"
          value="1842"
          icon={<FaChartLine />}
        />
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-8">
          Tracked Users
        </h2>

        {/* ONE CARD PER ROW */}

        <div className="space-y-8">
          {users.map((user) => (
            <UserCard
              key={user.handle}
              user={user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;