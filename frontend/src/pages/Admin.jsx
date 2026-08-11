import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaUsers,
  FaChartLine,
  FaSignOutAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../services/api";

function Admin() {
  const navigate = useNavigate();

  const [handle, setHandle] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const logout = () => {
    sessionStorage.removeItem("token");

    toast.success("Logged out successfully");

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const addUser = async () => {
    if (!handle.trim()) {
      toast.error("Enter a handle");
      return;
    }

    try {
      setLoading(true);

      await API.post("/users", {
        handle,
      });

      toast.success("User added");

      setHandle("");

      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to add user"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      await API.delete(`/users/${id}`);

      toast.success("User deleted");

      fetchUsers();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const avgRating =
    users.length > 0
      ? Math.round(
          users.reduce(
            (sum, user) =>
              sum + (user.rating || 0),
            0
          ) / users.length
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 text-white">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-5xl font-extrabold bg-linear-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Manage tracked Codeforces users
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-600/20"
        >
          <FaSignOutAlt />
          Logout
        </button>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400">
                Total Users
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {users.length}
              </h2>
            </div>

            <FaUsers
              size={32}
              className="text-blue-400"
            />
          </div>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400">
                Average Rating
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {avgRating}
              </h2>
            </div>

            <FaChartLine
              size={32}
              className="text-purple-400"
            />
          </div>
        </div>

      </div>

      {/* Add User */}

      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">

        <h2 className="text-2xl font-bold mb-5">
          Add User
        </h2>

        <div className="flex gap-4">

          <input
            value={handle}
            onChange={(e) =>
              setHandle(e.target.value)
            }
            placeholder="Enter Codeforces handle"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500"
          />

          <button
            onClick={addUser}
            disabled={loading}
            className="bg-linear-to-r from-blue-600 to-purple-600 px-8 rounded-2xl font-semibold flex items-center gap-3 hover:scale-105 transition"
          >
            <FaPlus />

            {loading
              ? "Adding..."
              : "Add User"}
          </button>

        </div>

      </div>

      {/* Users Table */}

      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">

        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold">
            Tracked Users ({users.length})
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="p-5 text-left">
                  Handle
                </th>

                <th className="p-5 text-left">
                  Rating
                </th>

                <th className="p-5 text-left">
                  Rank
                </th>

                <th className="p-5 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                >
                  <td className="p-5 font-semibold">
                    {user.handle}
                  </td>

                  <td className="p-5 text-blue-400 font-bold">
                    {user.rating}
                  </td>

                  <td className="p-5 capitalize">
                    {user.rank}
                  </td>

                  <td className="p-5 text-center">
                    <button
                      onClick={() =>
                        deleteUser(user._id)
                      }
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl flex items-center gap-2 mx-auto"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Admin;