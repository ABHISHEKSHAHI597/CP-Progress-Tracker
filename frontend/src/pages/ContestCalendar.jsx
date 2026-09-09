import { useEffect, useMemo, useState } from "react";

import { getCalendar } from "../services/calendarService";
import { UseDocumentTitle } from "../hooks/UseDocumentTitle";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const dayKey = (value) => new Date(value).toDateString();

function dayLabel(value) {
  const date = new Date(value);
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const timeLabel = (value) =>
  new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

function countdown(startTime, now) {
  const diff = new Date(startTime) - now;
  if (diff <= 0) return { text: "starting now", urgent: true };

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const urgent = diff < 6 * 3600000;

  if (days > 0) return { text: `${days}d ${hours}h`, urgent };
  if (hours > 0) return { text: `${hours}h ${minutes}m ${seconds}s`, urgent };

  return { text: `${minutes}m ${seconds}s`, urgent };
}

const toGCalDate = (date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

function googleCalendarLink(contest) {
  const start = new Date(contest.startTime);
  const end = new Date(start.getTime() + (contest.duration || 2) * 3600000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: contest.name,
    dates: `${toGCalDate(start)}/${toGCalDate(end)}`,
    details: `${contest.platform || "Codeforces"} contest. Details: ${contest.link}`,
    location: contest.link,
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}

function Tag({ children }) {
  return (
    <span className="font-mono text-[11.5px] text-mute border border-line rounded px-1.5 py-0.5">
      {children}
    </span>
  );
}

function ContestCalendar() {
  UseDocumentTitle("Calendar · CP Tracker");

  const [upcoming, setUpcoming] = useState([]);
  const [previous, setPrevious] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [platform, setPlatform] = useState("All");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let live = true;

    getCalendar()
      .then((data) => {
        if (!live) return;
        setUpcoming(data.upcoming || []);
        setPrevious(data.previous || []);
      })
      .catch(() => live && setFailed(true))
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const platforms = useMemo(
    () => ["All", ...new Set(upcoming.map((contest) => contest.platform || "Codeforces"))],
    [upcoming]
  );

  const filtered = useMemo(
    () =>
      platform === "All"
        ? upcoming
        : upcoming.filter((contest) => (contest.platform || "Codeforces") === platform),
    [upcoming, platform]
  );

  const days = useMemo(() => {
    const groups = new Map();

    filtered.forEach((contest) => {
      const key = dayKey(contest.startTime);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(contest);
    });

    return [...groups.entries()];
  }, [filtered]);

  if (loading) return <Loader label="Checking the contest schedule" />;

  if (failed) {
    return (
      <EmptyState
        title="Could not load the schedule"
        hint="The backend could not reach the contest APIs. Try again in a moment."
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Calendar"
        lede="Contests coming up across Codeforces, LeetCode, CodeChef and AtCoder, with the ones already finished below."
      />

      {upcoming.length === 0 ? (
        <EmptyState
          title="No contests announced"
          hint="Nothing is scheduled on any tracked platform right now. Check back in a day or two."
        />
      ) : (
        <section className="space-y-6">
          {platforms.length > 2 && (
            <div className="flex flex-wrap gap-1.5">
              {platforms.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPlatform(name)}
                  aria-pressed={platform === name}
                  className={`text-[13px] px-3 py-1.5 rounded-md border transition-colors ${
                    platform === name
                      ? "border-mute text-paper bg-ink-3"
                      : "border-line text-mute hover:text-paper"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {days.map(([key, contests]) => (
            <div key={key}>
              <div className="flex items-baseline gap-3 mb-2.5">
                <h2 className="text-[15px] font-semibold">{dayLabel(contests[0].startTime)}</h2>
                <span className="h-px flex-1 bg-line" />
                <span className="figure text-[12px] text-faint">
                  {contests.length} {contests.length === 1 ? "contest" : "contests"}
                </span>
              </div>

              <div className="border border-line rounded-lg overflow-hidden">
                {contests.map((contest) => {
                  const clock = countdown(contest.startTime, now);

                  return (
                    <article
                      key={contest.id}
                      className="border-b border-line-soft last:border-b-0 px-4 sm:px-5 py-4
                                 flex flex-col lg:flex-row lg:items-center gap-4"
                    >
                      <div className="figure text-[15px] text-paper w-20 shrink-0 whitespace-nowrap">
                        {timeLabel(contest.startTime)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] leading-snug">{contest.name}</h3>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Tag>{contest.platform || "Codeforces"}</Tag>
                          <Tag>{contest.duration}h</Tag>

                          <span
                            className="figure text-[12.5px]"
                            style={{ color: clock.urgent ? "var(--color-t5)" : "var(--color-mute)" }}
                          >
                            {clock.text}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <a
                          href={googleCalendarLink(contest)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[13px] text-mute hover:text-paper transition-colors"
                        >
                          Add to calendar
                        </a>

                        <a
                          href={contest.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[13px] px-3.5 py-2 rounded-md border border-line
                                     hover:border-mute transition-colors"
                        >
                          Register
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {previous.length > 0 && (
        <section>
          <div className="flex items-baseline gap-3 mb-2.5">
            <h2 className="text-[15px] font-semibold">Recently finished</h2>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="border border-line rounded-lg overflow-hidden">
            {previous.map((contest) => (
              <a
                key={contest.id}
                href={contest.link}
                target="_blank"
                rel="noreferrer"
                className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 sm:px-5 py-3.5
                           border-b border-line-soft last:border-b-0 hover:bg-ink-2 transition-colors"
              >
                <span className="figure text-[12.5px] text-faint w-24 shrink-0">
                  {new Date(contest.startTime).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                </span>

                <span className="text-[14px] flex-1 min-w-0">{contest.name}</span>

                <Tag>{contest.type}</Tag>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ContestCalendar;
