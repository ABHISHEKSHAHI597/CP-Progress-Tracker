import { useEffect, useState } from "react";

import API from "../services/api";
import { UseDocumentTitle } from "../hooks/UseDocumentTitle";

import PageHeader from "../components/PageHeader";
import FigureStrip from "../components/FigureStrip";
import Handle from "../components/Handle";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

import { formScore, formatScore } from "../lib/score";
import { formatRating, problemColor, tierColor } from "../lib/rank";

function ScoreBar({ score, top }) {
  const width = score > 0 && top > 0 ? Math.max((score / top) * 100, 1.5) : 0;

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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[13px] text-mute hover:text-paper transition-colors
                   inline-flex items-center gap-1.5"
      >
        How the score works
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="5.6" />
          <path d="M7 6.2v3.4M7 4.4v.1" strokeLinecap="round" />
        </svg>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="How the score works">
        <div className="space-y-4 text-[13.5px]">
          <p className="text-mute leading-relaxed">
            Standings rank the last 30 days of work, not your rating.
          </p>

          {/* Split across lines so it never needs sideways scrolling on a phone. */}
          <div className="rounded-lg border border-line bg-ink px-4 py-3.5">
            <pre className="font-mono text-[12.5px] sm:text-[13px] text-paper leading-relaxed m-0">
              {"score = Q · (A/1000)²\n        · 2^((A − U)/400)\n        · (1 + 0.05·C)"}
            </pre>
          </div>

          <dl className="space-y-2.5">
            {[
              ["Q", "problems solved in the last 30 days"],
              ["A", "their average difficulty"],
              ["U", "your current rating"],
              ["C", "contests entered in the last 30 days"],
            ].map(([symbol, meaning]) => (
              <div key={symbol} className="flex gap-3">
                <dt className="font-mono text-paper w-5 shrink-0">{symbol}</dt>
                <dd className="text-mute">{meaning}</dd>
              </div>
            ))}
          </dl>

          <p className="text-mute leading-relaxed border-t border-line-soft pt-4">
            Solving above your own rating counts exponentially more, so volume alone will not
            carry anyone to the top.
          </p>
        </div>
      </Modal>
    </>
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

  // Everyone appears, already ordered by score, so a quiet month sinks to the
  // bottom rather than dropping off the page.
  const top = users.length ? users[0].score : 0;

  const solved = users.reduce((sum, user) => sum + (user.solvedLast30Days || 0), 0);
  const contests = users.reduce((sum, user) => sum + (user.contestsLast30Days || 0), 0);

  // Averaged over the people who actually solved something, so a quiet month
  // does not drag the figure toward zero.
  const solvers = users.filter((user) => user.solvedLast30Days > 0);

  const difficulty = solvers.length
    ? Math.round(
        solvers.reduce((sum, user) => sum + (user.avgProblemRating30Days || 0), 0) / solvers.length
      )
    : 0;

  // An average difficulty of zero is never a real measurement. It means nothing
  // was solved, or nothing solved carried a difficulty, so show a dash.
  const windowRating = (value) => (value ? formatRating(value) : "\u2014");

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
          { label: "Tracked", value: users.length },
          { label: "Problems solved", value: solved },
          { label: "Contests entered", value: contests },
          { label: "Average difficulty", value: difficulty || "—", tone: problemColor(difficulty) },
          { label: "Leading score", value: formatScore(top) },
        ]}
      />

      {users.length === 0 ? (
        <EmptyState
          title="No one is being tracked yet"
          hint="Sign in as an admin and add a Codeforces handle to start the standings."
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
                {users.map((user, index) => (
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
                      {windowRating(user.avgProblemRating30Days)}
                    </td>

                    <td
                      className="py-3.5 px-3 text-right figure text-[14px]"
                      style={{ color: problemColor(user.medianProblemRating30Days) }}
                    >
                      {windowRating(user.medianProblemRating30Days)}
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
            {users.map((user, index) => (
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
                      value: windowRating(user.avgProblemRating30Days),
                      tone: problemColor(user.avgProblemRating30Days),
                    },
                    {
                      label: "Median",
                      value: windowRating(user.medianProblemRating30Days),
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

    </div>
  );
}

export default Leaderboard;
