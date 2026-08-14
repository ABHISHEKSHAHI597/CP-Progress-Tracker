import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import { UseDocumentTitle } from '../hooks/UseDocumentTitle';

function Login() {
  UseDocumentTitle('Admin Login');
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error(
        "Please enter username and password"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await API.post(
        "/admin/login",
        {
          username,
          password,
        }
      );

      sessionStorage.setItem(
        "token",
        res.data.token
      );

      toast.success(
        "Login successful"
      );

      navigate("/admin");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center px-4">

      {/* Background Effects */}

      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full" />

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full" />

      {/* Login Card */}

      <div className="relative z-10 w-full max-w-lg">

        <div className="text-center mb-8">

          {/* <h1 className="text-6xl font-black bg-linear-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
            CP Tracker
          </h1> */}

          {/* <p className="text-slate-400 mt-3 text-lg">
            Competitive Programming Progress Dashboard
          </p> */}
        </div>

        <form
          onSubmit={handleSubmit}
          className="
        bg-slate-900/70
        backdrop-blur-xl
        border border-slate-700/50
        rounded-3xl
        p-10
        shadow-[0_0_60px_rgba(59,130,246,0.15)]
      "
        >

          <div className="flex items-center justify-between mb-8">

            <div>
              <h2 className="text-4xl font-bold text-white">
                Admin Login
              </h2>

              <p className="text-slate-400 mt-2">
                Manage tracked Codeforces users
              </p>
            </div>

            <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium">
              Admin
            </div>
          </div>

          {/* Username */}

          <div className="mb-5">
            <label className="block text-slate-400 mb-2 text-sm">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className="
            w-full
            bg-slate-800/70
            border border-slate-700
            text-white
            px-5
            py-4
            rounded-2xl
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            transition-all
          "
            />
          </div>

          {/* Password */}

          <div className="mb-8">
            <label className="block text-slate-400 mb-2 text-sm">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="
            w-full
            bg-slate-800/70
            border border-slate-700
            text-white
            px-5
            py-4
            rounded-2xl
            outline-none
            focus:border-purple-500
            focus:ring-2
            focus:ring-purple-500/20
            transition-all
          "
            />
          </div>

          {/* Login */}

          <button
            type="submit"
            disabled={loading}
            className="
          w-full
          py-4
          rounded-2xl
          font-bold
          text-lg
          bg-linear-to-r
          from-blue-600
          to-purple-600
          hover:scale-[1.02]
          active:scale-[0.99]
          transition-all
          shadow-lg
        "
          >
            {loading
              ? "Signing In..."
              : "Login"}
          </button>

          {/* Back */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="
          w-full
          mt-4
          py-4
          rounded-2xl
          bg-slate-800
          hover:bg-slate-700
          text-white
          font-semibold
          transition-all
        "
          >
            Back to Home
          </button>

          <div className="mt-8 text-center text-sm text-slate-500">
            Authorized administrators only
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;