import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";

function Login() {
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Login
          </h1>

          <p className="text-slate-400 mb-8">
            Sign in to manage tracked users
          </p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl mb-4 outline-none border border-slate-700 focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl mb-6 outline-none border border-slate-700 focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition-all"
          >
            {loading
              ? "Signing In..."
              : "Login"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="w-full mt-4 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold text-white transition-all"
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;