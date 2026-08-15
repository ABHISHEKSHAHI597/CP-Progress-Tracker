import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaClock,
  FaTrophy,
  FaCode,
  FaRegCalendarPlus,
} from "react-icons/fa";

import { getCalendar } from "../services/calendarService";
import { UseDocumentTitle } from '../hooks/UseDocumentTitle';

function ContestCalendar() {
  UseDocumentTitle('Contest Calendar');
  const [upcoming, setUpcoming] = useState([]);
  const [previous, setPrevious] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchCalendar();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchCalendar = async () => {
    try {
      const data = await getCalendar();

      setUpcoming(data.upcoming || []);
      setPrevious(data.previous || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCountdown = (startTime) => {
    const diff = new Date(startTime) - now;

    if (diff <= 0) return "Starting Soon";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) /
        (1000 * 60 * 60)
    );
    const mins = Math.floor(
      (diff % (1000 * 60 * 60)) / (1000 * 60)
    );
    const secs = Math.floor(
      (diff % (1000 * 60)) / 1000
    );

    if (days > 0) {
      return `${days}d ${hrs}h ${mins}m left`;
    }

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s left`;
    }

    return `${mins}m ${secs}s left`;
  };

  const toGCalDate = (date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";

  const getGoogleCalendarLink = (contest) => {
    const start = new Date(contest.startTime);
    const end = new Date(
      start.getTime() + contest.duration * 60 * 60 * 1000
    );

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: contest.name,
      dates: `${toGCalDate(start)}/${toGCalDate(end)}`,
      details: `${contest.platform} contest: ${contest.name}. More info: ${contest.link}`,
      location: contest.link,
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold mb-2">
          📅 Contest Calendar
        </h1>

        <p className="text-slate-400 text-base">
          Upcoming and recent Codeforces contests.
        </p>
      </div>

      {/* Upcoming */}

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaCalendarAlt className="text-blue-400" />
          Upcoming Contests
        </h2>

        <div className="grid gap-4">
          {upcoming.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-slate-400 text-sm">
              No upcoming contests found.
            </div>
          ) : (
            upcoming.map((contest) => (
              <div
                key={contest.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500 transition"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {contest.name}
                    </h3>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <FaClock className="text-xs" />
                        {contest.duration} hrs
                      </span>

                      <span>
                        {new Date(
                          contest.startTime
                        ).toLocaleString()}
                      </span>

                      <span className="bg-blue-600/20 text-blue-400 px-2.5 py-0.5 rounded-full text-xs">
                        {contest.platform}
                      </span>
                    </div>

                    <div className="mt-2.5 text-yellow-400 font-semibold text-sm tabular-nums">
                      ⏳ {getCountdown(contest.startTime)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={getGoogleCalendarLink(contest)}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-sm rounded-xl font-medium h-fit transition flex items-center gap-2"
                      title="Add to Google Calendar"
                    >
                      <FaRegCalendarPlus className="text-xs" />
                      Add to Calendar
                    </a>

                    <a
                      href={contest.link}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm rounded-xl font-medium h-fit transition"
                    >
                      Register
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Previous */}

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaTrophy className="text-purple-400" />
          Previous Contests
        </h2>

        <div className="grid gap-4">
          {previous.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-slate-400 text-sm">
              No previous contests found.
            </div>
          ) : (
            previous.map((contest) => (
              <div
                key={contest.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-green-500 transition"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {contest.name}
                    </h3>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <FaCode className="text-xs" />
                        {contest.type}
                      </span>

                      <span>
                        {new Date(
                          contest.startTime
                        ).toLocaleString()}
                      </span>

                      <span>
                        Duration: {contest.duration} hrs
                      </span>
                    </div>
                  </div>

                  <a
                    href={contest.link}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-green-600 hover:bg-green-700 px-5 py-2.5 text-sm rounded-xl flex items-center gap-2 font-medium h-fit transition shrink-0"
                  >
                    Open Contest
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default ContestCalendar;