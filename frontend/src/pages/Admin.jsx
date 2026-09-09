import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import API from "../services/api";
import { UseDocumentTitle } from "../hooks/UseDocumentTitle";

import PageHeader from "../components/PageHeader";
import FigureStrip from "../components/FigureStrip";
import Handle from "../components/Handle";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import BackToTop from "../components/BackToTop";

import { formatRating, relativeTime, tierColor } from "../lib/rank";
import { clearToken } from "../lib/session";

function Admin() {
  UseDocumentTitle("Admin · CP Tracker");

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [handle, setHandle] = useState("");
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch {
      toast.error("Could not load the roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let live = true;

    API.get("/users")
      .then((res) => live && setUsers(res.data))
      .catch(() => live && toast.error("Could not load the roster"))
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, []);

  const signOut = () => {
    clearToken();
    navigate("/");
  };

  const addUser = async (event) => {
    event.preventDefault();

    if (!handle.trim()) {
      toast.error("Enter a Codeforces handle");
      return;
    }

    try {
      setAdding(true);

      await API.post("/users", { handle: handle.trim() });

      toast.success(`Now tracking ${handle.trim()}`);
      setHandle("");

      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add that handle");
    } finally {
      setAdding(false);
    }
  };

  const deleteUser = async (user) => {
    try {
      await API.delete(`/users/${user._id}`);

      toast.success(`Stopped tracking ${user.handle}`);
      setPending(null);

      fetchUsers();
    } catch {
      toast.error("Could not remove that handle");
    }
  };

  const rated = users.filter((user) => user.rating);

  const averageRating = rated.length
    ? Math.round(rated.reduce((sum, user) => sum + user.rating, 0) / rated.length)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur-md border-b border-line">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true">
              <rect x="2" y="20" width="5" height="7" rx="1.5" fill="#45c17f" />
              <rect x="10" y="14" width="5" height="13" rx="1.5" fill="#35c2c2" />
              <rect x="18" y="9" width="5" height="18" rx="1.5" fill="#5d8dfa" />
              <rect x="26" y="4" width="5" height="23" rx="1.5" fill="#f2994a" />
            </svg>
            <span className="wide font-semibold tracking-tight text-[17px]">CP Tracker</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-[13px] px-3 py-1.5 rounded-md border border-line text-mute
                         hover:text-paper hover:border-mute transition-colors"
            >
              View site
            </Link>

            <button
              type="button"
              onClick={signOut}
              className="text-[13px] px-3 py-1.5 rounded-md border border-line text-mute
                         hover:text-paper hover:border-mute transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-[1180px] px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <PageHeader
          title="Admin"
          lede="Add a Codeforces handle to start tracking it. Ratings and submissions refresh automatically after that."
        />

        {loading ? (
          <Loader label="Loading the roster" />
        ) : (
          <>
            <FigureStrip
              items={[
                { label: "Tracked handles", value: users.length },
                { label: "Rated", value: rated.length },
                {
                  label: "Average rating",
                  value: averageRating || "—",
                  tone: tierColor(averageRating),
                },
              ]}
            />

            <form onSubmit={addUser} className="border border-line rounded-lg p-4 sm:p-5">
              <label htmlFor="handle" className="block text-[15px] font-semibold">
                Add a handle
              </label>

              <p className="text-mute text-[13px] mt-1.5">
                Use the exact handle as it appears on Codeforces.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 mt-4">
                <input
                  id="handle"
                  value={handle}
                  onChange={(event) => setHandle(event.target.value)}
                  placeholder="tourist"
                  autoComplete="off"
                  spellCheck="false"
                  className="flex-1 bg-ink-2 border border-line rounded-md px-3.5 py-2.5 font-mono text-[14px]
                             placeholder:text-faint focus:border-accent focus:outline-none transition-colors"
                />

                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2.5 rounded-md bg-paper text-ink font-medium text-[14px]
                             hover:bg-white disabled:opacity-60 transition-colors"
                >
                  {adding ? "Adding…" : "Add handle"}
                </button>
              </div>
            </form>

            <section>
              <div className="flex items-baseline gap-3 mb-2.5">
                <h2 className="text-[15px] font-semibold">Tracked handles</h2>
                <span className="h-px flex-1 bg-line" />
                <span className="figure text-[12px] text-faint">{users.length}</span>
              </div>

              {users.length === 0 ? (
                <EmptyState
                  title="Nothing is being tracked yet"
                  hint="Add the first Codeforces handle above and the standings will start filling in."
                />
              ) : (
                <div className="border border-line rounded-lg overflow-hidden">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="border-b border-line-soft last:border-b-0 px-4 sm:px-5 py-3.5
                                 flex flex-wrap items-center gap-x-4 gap-y-3"
                    >
                      <span
                        className="h-8 w-[3px] rounded-full shrink-0"
                        style={{ background: tierColor(user.rating) }}
                        aria-hidden="true"
                      />

                      <span className="min-w-0 flex-1">
                        <Handle handle={user.handle} rating={user.rating} className="text-[15px]" />
                        <span className="block text-mute text-[12px] capitalize truncate">
                          {user.rank || "unrated"}
                        </span>
                      </span>

                      <span className="figure text-[14px] text-mute w-14 text-right shrink-0">
                        {formatRating(user.rating)}
                      </span>

                      <span className="text-[12.5px] text-faint w-24 text-right shrink-0 hidden sm:block">
                        {relativeTime(user.lastOnlineTime)}
                      </span>

                      {pending === user._id ? (
                        <span className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => deleteUser(user)}
                            className="text-[13px] px-3 py-1.5 rounded-md font-medium text-ink"
                            style={{ background: "var(--color-down)" }}
                          >
                            Remove
                          </button>

                          <button
                            type="button"
                            onClick={() => setPending(null)}
                            className="text-[13px] px-3 py-1.5 rounded-md border border-line text-mute hover:text-paper"
                          >
                            Keep
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPending(user._id)}
                          className="text-[13px] px-3 py-1.5 rounded-md border border-line text-mute
                                     hover:text-paper hover:border-mute transition-colors shrink-0"
                        >
                          Stop tracking
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <BackToTop />
    </div>
  );
}

export default Admin;
