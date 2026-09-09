import { useEffect, useState } from "react";

import API from "../services/api";
import { UseDocumentTitle } from "../hooks/UseDocumentTitle";

import PageHeader from "../components/PageHeader";
import FigureStrip from "../components/FigureStrip";
import Handle from "../components/Handle";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

import { formScore, formatScore } from "../lib/score";
import { formatRating, problemColor, tierColor } from "../lib/rank";

function ScoreBar({ score, top }) {
  const width = top > 0 ? Math.max((score / top) * 100, 1.5) : 0;

  return (
    <span className="block h-[5px] rounded-[2px] bg-ink-3 overflow-hidden mt-2">
      <span
        className="block h-full origin-left"
        style={{
          width: `${width}%`,
          background: "var(--color-mute)",
          animation: "sweep 600ms cubic-bezier(.2,.7,.2,1) both",
        }}
      />
    </span>
  );
}

function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-[13px]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="text-mute hover:text-paper transition-colors inline-flex items-center gap-1.5"
      >
        How the score works
        <svg
          width="12"
          height="12"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M3.5 5.5L7 9l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 border border-line rounded-lg bg-ink-2 p-4 max-w-[62ch] space-y-3">
          <p className="font-mono text-[12.5px] text-paper leading-relaxed">
            score = Q · (A/1000)² · 2^((A − U)/400) · (1 + 0.05·C)
          </p>

          <ul className="text-mute space-y-1.5">
            <li>
              <span className="font-mono text-paper">Q</span> — problems solved in the last 30 days
            </li>
            <li>
              <span className="font-mono text-paper">A</span> — their average difficulty
            </li>
            <li>
              <span className="font-mono text-paper">U</span> — your current rating
            </li>
            <li>
              <span className="font-mono text-paper">C</span> — contests entered in the last 30 days
            </li>
          </ul>

          <p className="text-mute">
            Solving above your own rating counts exponentially more, so volume alone will not
            carry anyone to the top.
          </p>
        </div>
      )}
    </div>
  );
}

function Leaderboard() {
  UseDocumentTitle("Standings · CP Tracker");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;

    API.get("/users")
      .then((res) => {
        if (!live) return;

        setUsers(
          res.data
            .map((user) => ({ ...user, score: formScore(user) }))
            .sort((a, b) => b.score - a.score)
        );
      })
      .catch(() => live && setFailed(true))
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, []);

  if (loading) return <Loader label="Ranking the last 30 days" />;

  if (failed) {
    return (
      <EmptyState
        title="Could not reach the tracker service"
        hint="The service is not answering right now. Try again in a moment."
      />
    );
  }

  const active = users.filter((user) => user.score > 0);
  const top = active.length ? active[0].score : 0;

  const solved = users.reduce((sum, user) => sum + (user.solvedLast30Days || 0), 0);
  const contests = users.reduce((sum, user) => sum + (user.contestsLast30Days || 0), 0);

  const difficulty = active.length
    ? Math.round(
        active.reduce((sum, user) => sum + (user.avgProblemRating30Days || 0), 0) / active.length
      )
    : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Standings"
        lede="Ranked by form over the last 30 days rather than by rating, so recent work counts more than a number earned a year ago."
      >
        <HowItWorks />
      </PageHeader>

      <FigureStrip
        items={[
          { label: "In the running", value: active.length },
          { label: "Problems solved", value: solved },
          { label: "Contests entered", value: contests },
          { label: "Average difficulty", value: difficulty || "—", tone: problemColor(difficulty) },
          { label: "Leading score", value: formatScore(top) },
        ]}
      />

      {active.length === 0 ? (
        <EmptyState
          title="Nothing solved in the last 30 days"
          hint="Standings fill in as soon as anyone on the roster submits an accepted solution."
        />
      ) : (
        <>
          {/* Table — from large screens up */}
          <div className="hidden lg:block border border-line rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-faint text-[12px] bg-ink-2 border-b border-line">
                  <th className="font-normal text-left py-2.5 pl-5 pr-2 w-14">#</th>
                  <th className="font-normal text-left py-2.5 px-2">User</th>
                  <th className="font-normal text-right py-2.5 px-3 w-24">Rating</th>
                  <th className="font-normal text-right py-2.5 px-3 w-24">Solved</th>
                  <th className="font-normal text-right py-2.5 px-3 w-24">Contests</th>
                  <th className="font-normal text-right py-2.5 px-3 w-28">Avg</th>
                  <th className="font-normal text-right py-2.5 px-3 w-28">Median</th>
                  <th className="font-normal text-right py-2.5 pl-3 pr-5 w-40">Form</th>
                </tr>
              </thead>

              <tbody>
                {active.map((user, index) => (
                  <tr
                    key={user._id}
                    className="border-b border-line-soft last:border-b-0 hover:bg-ink-2 transition-colors"
                  >
                    <td className="py-3.5 pl-5 pr-2">
                      <span
                        className={`figure text-[15px] ${index < 3 ? "text-paper" : "text-faint"}`}
                      >
                        {index + 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-7 w-[3px] rounded-full shrink-0"
                          style={{ background: tierColor(user.rating) }}
                          aria-hidden="true"
                        />

                        <span className="min-w-0">
                          <Handle handle={user.handle} rating={user.rating} className="text-[15px]" />
                          <span className="block text-mute text-[12px] capitalize truncate">
                            {user.rank || "unrated"}
                          </span>
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right figure text-[14px]">
                      {formatRating(user.rating)}
                    </td>

                    <td className="py-3.5 px-3 text-right figure text-[14px]">
                      {user.solvedLast30Days ?? 0}
                    </td>

                    <td className="py-3.5 px-3 text-right figure text-[14px]">
                      {user.contestsLast30Days ?? 0}
                    </td>

                    <td
                      className="py-3.5 px-3 text-right figure text-[14px]"
                      style={{ color: problemColor(user.avgProblemRating30Days) }}
                    >
                      {formatRating(user.avgProblemRating30Days)}
                    </td>

                    <td
                      className="py-3.5 px-3 text-right figure text-[14px]"
                      style={{ color: problemColor(user.medianProblemRating30Days) }}
                    >
                      {formatRating(user.medianProblemRating30Days)}
                    </td>

                    <td className="py-3.5 pl-3 pr-5 text-right">
                      <span className="figure wide text-[16px] font-semibold">
                        {formatScore(user.score)}
                      </span>
                      <ScoreBar score={user.score} top={top} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rows — phones and tablets */}
          <div className="lg:hidden border border-line rounded-lg overflow-hidden">
            {active.map((user, index) => (
              <div
                key={user._id}
                className="border-b border-line-soft last:border-b-0 px-3 sm:px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`figure text-[15px] w-5 shrink-0 ${
                      index < 3 ? "text-paper" : "text-faint"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <span
                    className="h-8 w-[3px] rounded-full shrink-0"
                    style={{ background: tierColor(user.rating) }}
                    aria-hidden="true"
                  />

                  <span className="min-w-0 flex-1">
                    <Handle handle={user.handle} rating={user.rating} className="text-[15px]" />
                    <span className="block text-[12px] truncate">
                      <span className="text-mute capitalize">{user.rank || "unrated"}</span>
                      <span className="figure text-faint ml-2">{formatRating(user.rating)}</span>
                    </span>
                  </span>

                  <span className="shrink-0 text-right w-[74px]">
                    <span className="figure wide text-[17px] font-semibold block leading-none">
                      {formatScore(user.score)}
                    </span>
                    <ScoreBar score={user.score} top={top} />
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-3.5 pl-8">
                  {[
                    { label: "Solved", value: user.solvedLast30Days ?? 0 },
                    { label: "Contests", value: user.contestsLast30Days ?? 0 },
                    {
                      label: "Avg",
                      value: formatRating(user.avgProblemRating30Days),
                      tone: problemColor(user.avgProblemRating30Days),
                    },
                    {
                      label: "Median",
                      value: formatRating(user.medianProblemRating30Days),
                      tone: problemColor(user.medianProblemRating30Days),
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-faint text-[11px] leading-none">{item.label}</p>
                      <p
                        className="figure text-[14px] mt-1.5 leading-none"
                        style={item.tone ? { color: item.tone } : undefined}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {users.length > active.length && (
        <p className="text-faint text-[12.5px]">
          {users.length - active.length} tracked{" "}
          {users.length - active.length === 1 ? "user has" : "users have"} no solves in the last 30
          days and do not appear above.
        </p>
      )}
    </div>
  );
}

export default Leaderboard;
