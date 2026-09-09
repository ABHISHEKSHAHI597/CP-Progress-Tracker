import { useState } from "react";
import { toast } from "react-toastify";

import API from "../services/api";
import Handle from "./Handle";
import Sparkline from "./Sparkline";
import { problemColor, relativeTime, tierOf } from "../lib/rank";

function Cell({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-faint text-[11.5px] leading-none">{label}</p>
      <p className="figure text-[14px] mt-1.5 leading-none truncate">{value}</p>
    </div>
  );
}

function RosterRow({ user, onRefreshed }) {
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // The background job sweeps everyone every half hour. This is for the person
  // who just solved something and does not want to wait for it.
  const refresh = async () => {
    try {
      setRefreshing(true);

      const { data } = await API.post(`/users/${user._id}/refresh`);

      onRefreshed?.(data.user);

      toast.success(
        data.outcome === "unchanged"
          ? `${user.handle} is already up to date`
          : `Updated ${user.handle}`
      );
    } catch (error) {
      const retryAfter = error.response?.data?.retryAfter;

      toast.error(
        retryAfter
          ? `Just refreshed. Try again in ${retryAfter}s.`
          : error.response?.data?.message || "Could not reach Codeforces"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const tier = tierOf(user.rating);
  const history = user.contestHistory || [];
  const recent = user.recentSolved || [];

  return (
    <div className="border-b border-line-soft last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="w-full text-left flex items-center gap-4 px-3 sm:px-4 py-3.5 hover:bg-ink-2 transition-colors"
      >
        <span
          className="w-[3px] self-stretch rounded-full shrink-0"
          style={{ background: tier.color }}
          aria-hidden="true"
        />

        <span className="min-w-0 flex-1">
          <Handle handle={user.handle} rating={user.rating} link={false} className="text-[15px]" />
          <span className="block text-mute text-[12.5px] mt-0.5 capitalize truncate">
            {user.rank || "unrated"}
          </span>
        </span>

        <span className="hidden lg:block shrink-0">
          <Sparkline
            points={history.slice(-12).map((contest) => contest.newRating)}
            color={tier.color}
          />
        </span>

        <span className="hidden sm:grid grid-cols-3 gap-6 shrink-0 text-right">
          <Cell label="30 days" value={user.solvedLast30Days ?? 0} />
          <Cell label="Solved" value={(user.totalSolved ?? 0).toLocaleString()} />
          <Cell label="Contests" value={user.contestCount ?? 0} />
        </span>

        <span className="shrink-0 text-right w-[62px]">
          <span
            className="figure wide block text-[21px] font-semibold leading-none"
            style={{ color: tier.color }}
          >
            {user.rating ?? "—"}
          </span>
          <span className="block text-faint text-[11.5px] mt-1 leading-none">
            max {user.maxRating ?? "—"}
          </span>
        </span>

        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`text-faint shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M3.5 5.5L7 9l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="px-4 sm:px-7 pb-5 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 pb-4">
            <Cell label="Peak rank" value={<span className="capitalize">{user.maxRank || "—"}</span>} />
            <Cell label="Contribution" value={user.contribution ?? 0} />
            <Cell label="Followers" value={user.friendOfCount ?? 0} />
            <Cell label="Last seen" value={relativeTime(user.lastOnlineTime)} />

            <span className="sm:hidden contents">
              <Cell label="Solved in 30 days" value={user.solvedLast30Days ?? 0} />
              <Cell label="Solved overall" value={(user.totalSolved ?? 0).toLocaleString()} />
            </span>
          </div>

          {recent.length > 0 && (
            <div className="pt-4 border-t border-line-soft">
              <p className="text-faint text-[11.5px] mb-2.5">Most recent solves</p>

              <div className="flex flex-wrap gap-1.5">
                {recent.map((problem, index) => (
                  <a
                    key={`${problem.contestId}-${problem.index}-${index}`}
                    href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                    target="_blank"
                    rel="noreferrer"
                    title={problem.problemName}
                    className="font-mono text-[12px] px-2 py-1 rounded border border-line
                               hover:border-mute transition-colors"
                  >
                    {problem.contestId}
                    {problem.index}
                    <span className="ml-1.5" style={{ color: problemColor(problem.rating) }}>
                      {problem.rating || "?"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-5">
            <a
              href={`https://codeforces.com/profile/${user.handle}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-mute hover:text-paper transition-colors"
            >
              Open profile on Codeforces
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 2h6v6M10 2L2.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-[13px] text-mute hover:text-paper
                         disabled:text-faint transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={refreshing ? { animation: "spin 900ms linear infinite" } : undefined}
              >
                <path d="M12 7a5 5 0 1 1-1.6-3.7" strokeLinecap="round" />
                <path d="M12 1.5V4h-2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {refreshing ? "Checking Codeforces" : "Check for new solves"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RosterRow;
