import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import ContestTracker from "./pages/ContestTracker";
import ContestCalendar from "./pages/ContestCalendar";
import Leaderboard from "./pages/Leaderboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Pages with Sidebar */}

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/leaderboard"
            element={<Leaderboard />}
          />

          <Route
            path="/contests"
            element={<ContestTracker />}
          />

          <Route
            path="/calendar"
            element={<ContestCalendar />}
          />

        </Route>

        {/* Login */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Admin WITHOUT Sidebar */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;