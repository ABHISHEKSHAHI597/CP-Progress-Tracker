import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import API from "../services/api";
import { UseDocumentTitle } from "../hooks/UseDocumentTitle";
import { BANDS } from "../lib/rank";

function Login() {
  UseDocumentTitle("Sign in · CP Tracker");

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const field =
    "w-full bg-ink-2 border border-line rounded-md px-3.5 py-2.5 text-[15px] " +
    "placeholder:text-faint focus:border-accent focus:outline-none transition-colors";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Enter both a username and a password.");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/admin/login", { username, password });

      sessionStorage.setItem("token", res.data.token);
      toast.success("Signed in");

      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response
            ? "That username and password do not match."
            : "Could not reach the tracker service.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[380px]">
        <Link to="/" className="flex items-center gap-2.5 mb-8 w-fit">
          <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true">
            <rect x="2" y="20" width="5" height="7" rx="1.5" fill="#45c17f" />
            <rect x="10" y="14" width="5" height="13" rx="1.5" fill="#35c2c2" />
            <rect x="18" y="9" width="5" height="18" rx="1.5" fill="#5d8dfa" />
            <rect x="26" y="4" width="5" height="23" rx="1.5" fill="#f2994a" />
          </svg>
          <span className="wide font-semibold tracking-tight text-[17px]">CP Tracker</span>
        </Link>

        <div className="border border-line rounded-lg overflow-hidden">
          <div className="flex h-1" aria-hidden="true">
            {BANDS.map((band) => (
              <span
                key={band.from}
                style={{ background: band.color, opacity: 0.6, flex: band.to - band.from }}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-7" noValidate>
            <h1 className="text-[22px] font-semibold">Sign in</h1>

            <p className="text-mute text-[13.5px] mt-1.5">
              Admins add and remove the Codeforces handles this site tracks.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="username" className="block text-[13px] text-mute mb-1.5">
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={field}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[13px] text-mute mb-1.5">
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={reveal ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={`${field} pr-16`}
                  />

                  <button
                    type="button"
                    onClick={() => setReveal((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12.5px] text-faint hover:text-paper px-1"
                  >
                    {reveal ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-[13px]" style={{ color: "var(--color-down)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-2.5 rounded-md bg-paper text-ink font-medium text-[14.5px]
                         hover:bg-white disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <Link
          to="/"
          className="block mt-5 text-[13px] text-faint hover:text-paper transition-colors"
        >
          Back to the standings
        </Link>
      </div>
    </div>
  );
}

export default Login;
