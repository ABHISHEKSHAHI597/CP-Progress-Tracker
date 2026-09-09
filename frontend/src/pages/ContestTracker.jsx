import { useEffect, useMemo, useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import API from "../services/api";
import { UseDocumentTitle } from "../hooks/UseDocumentTitle";

import PageHeader from "../components/PageHeader";
import FigureStrip from "../components/FigureStrip";
import Handle from "../components/Handle";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

import { BANDS, formatRating, tierColor } from "../lib/rank";

function Delta({ value }) {
  const positive = value >= 0;

  return (
    <span
      className="figure text-[13px] font-medium"
      style={{ color: positive ? "var(--color-up)" : "var(--color-down)" }}
    >
      {positive ? "+" : "−"}
      {Math.abs(value)}
    </span>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  return (
    <div className="border border-line bg-ink rounded-md px-3 py-2.5 shadow-xl max-w-[280px]">
      <p className="text-[12.5px] text-paper leading-snug">{point.fullName || label}</p>

      <p className="mt-1.5 flex items-center gap-2.5">
        <span
          className="figure wide text-[17px] font-semibold"
          style={{ color: tierColor(point.rating) }}
        >
          {point.rating}
        </span>
        <Delta value={point.change} />
      </p>

      <p className="text-faint text-[11.5px] mt-1">
        Rank {point.rank?.toLocaleString()}
      </p>
    </div>
  );
}

function ContestTracker() {
  UseDocumentTitle("Progress · CP Tracker");

  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let live = true;

    API.get("/users")
      .then((res) => {
        if (!live) return;

        setUsers(res.data);
        if (res.data.length) setSelectedId(res.data[0]._id);
      })
      .catch(() => live && setFailed(true))
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, []);

  const selected = users.find((user) => user._id === selectedId) || null;
  const history = useMemo(() => selected?.contestHistory || [], [selected]);

  const chart = useMemo(
    () =>
      history.map((contest, index) => ({
        index: index + 1,
        at: contest.contestTime ? new Date(contest.contestTime).getTime() : index,
        fullName: contest.contestName,
        rating: contest.newRating,
        change: contest.ratingChange,
        rank: contest.rank,
      })),
    [history]
  );

  // Round the window out to whole hundreds, then label it at the tier
  // boundaries so the gridlines and the colour bands agree.
  const [bounds, ticks] = useMemo(() => {
    if (!chart.length) return [[800, 1600], [800, 1200, 1600]];

    const values = chart.map((point) => point.rating);
    const low = Math.max(0, Math.floor((Math.min(...values) - 100) / 100) * 100);
    const high = Math.ceil((Math.max(...values) + 100) / 100) * 100;

    const clearance = (high - low) * 0.08;

    const inner = BANDS.map((band) => band.from).filter(
      (value) => value > low + clearance && value < high - clearance
    );

    return [[low, high], [low, ...inner, high]];
  }, [chart]);

  if (loading) return <Loader label="Loading contest history" />;

  if (failed) {
    return (
      <EmptyState
        title="Could not reach the tracker service"
        hint="The backend is not responding. Start it, then reload this page."
      />
    );
  }

  const bestRank = history.length ? Math.min(...history.map((contest) => contest.rank)) : null;
  const bestGain = history.length ? Math.max(...history.map((contest) => contest.ratingChange)) : null;
  const lastChange = history.length ? history[history.length - 1].ratingChange : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Progress"
        lede="Every rated contest for one person, plotted against the tier they were climbing through."
      />

      {users.length === 0 ? (
        <EmptyState
          title="No one is being tracked yet"
          hint="Sign in as an admin and add a Codeforces handle to start collecting contest history."
        />
      ) : (
        <>
          <div className="space-y-3">
            {users.length > 12 && (
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a handle"
                aria-label="Find a handle"
                className="w-full sm:max-w-[280px] bg-ink-2 border border-line rounded-md
                           px-3.5 py-2 font-mono text-[13px] placeholder:text-faint
                           focus:border-accent focus:outline-none transition-colors"
              />
            )}

            <div className="flex flex-wrap gap-1.5">
            {users
              .filter((user) =>
                user.handle.toLowerCase().includes(query.trim().toLowerCase())
              )
              .map((user) => {
              const active = user._id === selectedId;
              const colour = tierColor(user.rating);

              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => {
                    setSelectedId(user._id);
                    setShowAll(false);
                  }}
                  aria-pressed={active}
                  className="font-mono text-[13px] px-3 py-1.5 rounded-md border transition-colors"
                  style={{
                    color: active ? "#0b0d10" : colour,
                    background: active ? colour : "transparent",
                    borderColor: active ? colour : "var(--color-line)",
                  }}
                >
                  {user.handle}
                </button>
              );
            })}
            </div>
          </div>

          {selected && (
            <>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2 className="text-[22px] font-semibold">
                  <Handle handle={selected.handle} rating={selected.rating} className="text-[22px]" />
                </h2>

                <span className="text-mute text-[14px] capitalize">
                  {selected.rank || "unrated"}
                </span>
              </div>

              <FigureStrip
                items={[
                  {
                    label: "Current rating",
                    value: formatRating(selected.rating),
                    tone: tierColor(selected.rating),
                  },
                  {
                    label: "Peak rating",
                    value: formatRating(selected.maxRating),
                    tone: tierColor(selected.maxRating),
                  },
                  { label: "Contests", value: selected.contestCount ?? 0 },
                  { label: "Best rank", value: bestRank ? bestRank.toLocaleString() : "—" },
                  {
                    label: "Biggest gain",
                    value: bestGain === null ? "—" : `+${bestGain}`,
                    tone: bestGain > 0 ? "var(--color-up)" : undefined,
                  },
                ]}
              />

              <section className="border border-line rounded-lg overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-line bg-ink-2">
                  <h3 className="text-[15px] font-semibold">Rating over time</h3>

                  {lastChange !== null && (
                    <p className="text-[12.5px] text-mute">
                      Last contest <Delta value={lastChange} />
                    </p>
                  )}
                </div>

                {chart.length === 0 ? (
                  <p className="text-mute text-[14px] px-5 py-12 text-center">
                    {selected.handle} has not competed in a rated contest yet.
                  </p>
                ) : (
                  <div className="h-[260px] sm:h-[340px] p-3 sm:p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chart} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
                        {BANDS.map((band) => (
                          <ReferenceArea
                            key={band.from}
                            y1={band.from}
                            y2={band.to}
                            fill={band.color}
                            fillOpacity={0.12}
                            stroke="none"
                            ifOverflow="hidden"
                          />
                        ))}

                        <CartesianGrid stroke="#1b1f26" vertical={false} />

                        <XAxis
                          dataKey="at"
                          type="number"
                          scale="time"
                          domain={["dataMin", "dataMax"]}
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString(undefined, {
                              month: "short",
                              year: "2-digit",
                            })
                          }
                          tick={{ fill: "#5c626c", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                          axisLine={{ stroke: "#262b33" }}
                          tickLine={false}
                          minTickGap={44}
                        />

                        <YAxis
                          domain={bounds}
                          ticks={ticks}
                          interval={0}
                          tick={{ fill: "#5c626c", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                          axisLine={false}
                          tickLine={false}
                          width={48}
                        />

                        <Tooltip
                          content={<ChartTooltip />}
                          cursor={{ stroke: "#3a414c", strokeWidth: 1 }}
                        />

                        <Line
                          type="linear"
                          dataKey="rating"
                          stroke={tierColor(selected.rating)}
                          strokeWidth={1.8}
                          dot={{ r: 2.2, fill: tierColor(selected.rating), strokeWidth: 0 }}
                          activeDot={{ r: 4.5 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <p className="text-faint text-[11.5px] px-4 sm:px-5 py-3 border-t border-line">
                  Bands mark the Codeforces tiers, from Newbie at the bottom to Legendary
                  Grandmaster at the top.
                </p>
              </section>

              {history.length > 0 && (
                <section className="border border-line rounded-lg overflow-hidden">
                  <div className="px-4 sm:px-5 py-3.5 border-b border-line bg-ink-2">
                    <h3 className="text-[15px] font-semibold">
                      Contest history
                      <span className="text-faint font-normal ml-2 text-[13px]">
                        {history.length}
                      </span>
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px]">
                      <thead>
                        <tr className="text-faint text-[12px] border-b border-line">
                          <th className="font-normal text-left py-2.5 pl-4 sm:pl-5 pr-3">Contest</th>
                          <th className="font-normal text-right py-2.5 px-3 w-24">Rank</th>
                          <th className="font-normal text-right py-2.5 px-3 w-24">Rating</th>
                          <th className="font-normal text-right py-2.5 pl-3 pr-4 sm:pr-5 w-24">
                            Change
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {history
                          .slice()
                          .reverse()
                          .slice(0, showAll ? undefined : 20)
                          .map((contest) => (
                            <tr
                              key={contest.contestId}
                              className="border-b border-line-soft last:border-b-0 hover:bg-ink-2 transition-colors"
                            >
                              <td className="py-3 pl-4 sm:pl-5 pr-3 text-[13.5px]">
                                <a
                                  href={`https://codeforces.com/contest/${contest.contestId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline underline-offset-4"
                                >
                                  {contest.contestName}
                                </a>
                              </td>

                              <td className="py-3 px-3 text-right figure text-[13.5px] text-mute">
                                {contest.rank?.toLocaleString()}
                              </td>

                              <td
                                className="py-3 px-3 text-right figure text-[13.5px]"
                                style={{ color: tierColor(contest.newRating) }}
                              >
                                {contest.newRating}
                              </td>

                              <td className="py-3 pl-3 pr-4 sm:pr-5 text-right">
                                <Delta value={contest.ratingChange} />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {history.length > 20 && (
                    <button
                      type="button"
                      onClick={() => setShowAll((prev) => !prev)}
                      className="w-full py-3 text-[13px] text-mute hover:text-paper
                                 border-t border-line transition-colors"
                    >
                      {showAll
                        ? "Show the 20 most recent"
                        : `Show all ${history.length} contests`}
                    </button>
                  )}
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ContestTracker;
