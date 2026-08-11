import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      const res =
        await axios.post(
          "http://localhost:5000/api/admin/login",
          {
            username,
            password,
          }
        );

      localStorage.setItem(
        "token",
        res.data.token
      );

      navigate("/admin");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-2xl w-[400px]"
      >
        <h1 className="text-3xl font-bold text-white mb-6">
          Admin Login
        </h1>

        <input
          className="w-full p-3 rounded-lg bg-slate-800 text-white mb-4"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
        />

        <input
          type="password"
          className="w-full p-3 rounded-lg bg-slate-800 text-white mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <button
          className="w-full bg-blue-600 py-3 rounded-lg"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;