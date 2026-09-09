import { useEffect, useState } from "react";

import API from "../services/api";
import { UseDocumentTitle } from "../hooks/UseDocumentTitle";

import PageHeader from "../components/PageHeader";
import FigureStrip from "../components/FigureStrip";
import RatingLadder from "../components/RatingLadder";
import RosterRow from "../components/RosterRow";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { tierColor } from "../lib/rank";

const SORTS = [
  { key: "rating", label: "Rating" },
  { key: "solvedLast30Days", label: "Last 30 days" },
  { key: "totalSolved", label: "Solved" },
  { key: "contestCount", label: "Contests" },
];

function Home() {
  UseDocumentTitle("Overview · CP Tracker");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [sort, setSort] = useState("rating");

  useEffect(() => {
    let live = true;

    API.get("/users")
      .then((res) => live && setUsers(res.data))
      .catch(() => live && setFailed(true))
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, []);

  if (loading) return <Loader label="Fetching the roster" />;

  if (failed) {
    return (
      <EmptyState
        title="Could not reach the tracker service"
        hint="The service is not answering right now. Try again in a moment."
      />
    );
  }

  const rated = users.filter((user) => user.rating);

  const totalSolved = users.reduce((sum, user) => sum + (user.totalSolved || 0), 0);
  const solved30 = users.reduce((sum, user) => sum + (user.solvedLast30Days || 0), 0);

  const averageRating = rated.length
    ? Math.round(rated.reduce((sum, user) => sum + user.rating, 0) / rated.length)
    : 0;

  const peak = rated.length ? Math.max(...rated.map((user) => user.rating)) : 0;

  const sorted = [...users].sort((a, b) => (b[sort] || 0) - (a[sort] || 0));

  return (
    <div className="space-y-10">
      <PageHeader
        title="Overview"
        lede="Where everyone in the group currently sits on the Codeforces ladder, and what they have solved lately."
      />

      {users.length === 0 ? (
        <EmptyState
          title="No one is being tracked yet"
          hint="Sign in as an admin and add a Codeforces handle to start collecting ratings and submissions."
        />
      ) : (
        <>
          <RatingLadder users={users} />

          <FigureStrip
            items={[
              { label: "Tracked", value: users.length },
              { label: "Average rating", value: averageRating, tone: tierColor(averageRating) },
              { label: "Highest rating", value: peak, tone: tierColor(peak) },
              { label: "Solved in 30 days", value: solved30 },
              { label: "Solved overall", value: totalSolved.toLocaleString() },
            ]}
          />

          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 mb-3">
              <h2 className="text-[19px] font-semibold">
                Roster
                <span className="text-faint font-normal ml-2 text-[15px]">{users.length}</span>
              </h2>

              <div className="flex items-center gap-1 text-[13px]">
                <span className="text-faint mr-1.5">Sort by</span>

                {SORTS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSort(option.key)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      sort === option.key
                        ? "text-paper bg-ink-3"
                        : "text-mute hover:text-paper"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-line rounded-lg overflow-hidden">
              {sorted.map((user) => (
                <RosterRow
                  key={user._id}
                  user={user}
                  onRefreshed={(fresh) =>
                    setUsers((current) =>
                      current.map((entry) => (entry._id === fresh._id ? fresh : entry))
                    )
                  }
                />
              ))}
            </div>

            <p className="text-faint text-[12.5px] mt-3">
              Open a row for peak rank, activity and the problems they solved most recently.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
