import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaUsers,
  FaChartLine,
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaHome,
} from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../services/api";
import BackToTop from "../components/BackToTop";

function Admin() {
  const navigate = useNavigate();

  const [handle, setHandle] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const logout = () => {
    sessionStorage.removeItem("token");

    toast.success("Directing to Home", {
      autoClose: 1000,
    });

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

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 text-white">

      {/* Header */}

      <div className="flex items-center justify-between flex-wrap gap-4">

        <div>
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>

          <p className="text-slate-400 mt-1.5 text-sm">
            Manage tracked Codeforces users
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-300"
          >
            <FaHome />
            Home
          </button>

          {/* <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-600/20"
          >
            <FaSignOutAlt />
            Logout
          </button> */}
        </div>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-2 gap-4">

        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">
                Total Users
              </p>

              <h2 className="text-3xl font-bold mt-1.5">
                {users.length}
              </h2>
            </div>

            <FaUsers
              size={24}
              className="text-blue-400"
            />
          </div>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">
                Average Rating
              </p>

              <h2 className="text-3xl font-bold mt-1.5">
                {avgRating}
              </h2>
            </div>

            <FaChartLine
              size={24}
              className="text-purple-400"
            />
          </div>
        </div>

      </div>

      {/* Add User */}

      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-5">

        <h2 className="text-lg font-bold mb-4">
          Add User
        </h2>

        <div className="flex gap-3">

          <input
            value={handle}
            onChange={(e) =>
              setHandle(e.target.value)
            }
            placeholder="Enter Codeforces handle"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
          />

          <button
            onClick={addUser}
            disabled={loading}
            className="bg-linear-to-r from-blue-600 to-purple-600 px-6 rounded-xl text-sm font-semibold flex items-center gap-2 hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
          >
            <FaPlus />

            {loading
              ? "Adding..."
              : "Add User"}
          </button>

        </div>

      </div>

      {/* Users Table */}

      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">

        <div className="p-5 border-b border-slate-800">
          <h2 className="text-lg font-bold">
            Tracked Users ({users.length})
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-800">
                <th className="p-4 text-left">
                  Handle
                </th>

                <th className="p-4 text-left">
                  Rating
                </th>

                <th className="p-4 text-left">
                  Rank
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                >
                  <td className="p-4 font-semibold">
                    {user.handle}
                  </td>

                  <td className="p-4 text-blue-400 font-bold">
                    {user.rating}
                  </td>

                  <td className="p-4 capitalize text-slate-300">
                    {user.rank}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={`https://codeforces.com/profile/${user.handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition"
                      >
                        <FaExternalLinkAlt className="text-xs" />
                        View Profile
                      </a>

                      <button
                        onClick={() =>
                          deleteUser(user._id)
                        }
                        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

      <BackToTop />
    </div>

  );
}

export default Admin;